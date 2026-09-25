
import io
import os
import tempfile
from collections import defaultdict

import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

import swasthone_rppg_FINAL_V2 as v2

app = Flask(__name__)
CORS(app)


def _method_summaries(window_results):
    """Presentation-only summaries; does not participate in V2 scoring."""
    by_method = defaultdict(list)
    for window in window_results:
        for item in window.get("individual", []):
            by_method[item["method"]].append(item)

    summaries = []
    for method, items in by_method.items():
        weights = np.asarray(
            [max(1e-6, float(item.get("snr", 0.0)) + 6.0) for item in items],
            dtype=float,
        )
        hrs = np.asarray([float(item["hr"]) for item in items], dtype=float)
        hr = float(np.average(hrs, weights=weights)) if len(hrs) else None
        summaries.append({
            "method": method,
            "heartRate": round(hr) if hr is not None else None,
        })
    summaries.sort(key=lambda x: x["method"])
    return summaries


def analyze_video(file_storage):
    # The V2 algorithm itself is unchanged. This function replaces only the
    # local cv2.VideoCapture camera adapter with frames decoded from the
    # browser-recorded video.
    suffix = ".webm"
    filename = (file_storage.filename or "").lower()
    if filename.endswith(".mp4"):
        suffix = ".mp4"
    elif filename.endswith(".mov"):
        suffix = ".mov"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        file_storage.save(tmp)
        video_path = tmp.name

    cap = cv2.VideoCapture(video_path)
    try:
        if not cap.isOpened():
            raise RuntimeError(
                "Could not decode the browser recording. "
                "Make sure the browser supports WebM recording."
            )

        # video_fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)

        # # Some OpenCV/WebM combinations report the container timebase
        # # (e.g. 1000 FPS) instead of the actual recording FPS.
        # # Browser MediaRecorder recordings are expected to be ~30 FPS here.
        # if not np.isfinite(video_fps) or video_fps <= 1.0 or video_fps > 60.0:
        video_fps = 30.0
        fs = video_fps

        # Same V2 setup as main()
        cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        if cascade.empty():
            raise RuntimeError("Could not load face detector.")

        buffers = {"Forehead": [], "Left Cheek": [], "Right Cheek": []}
        all_face_history = []
        brightness_history = []
        smoothed_face = None
        frames = 0
        last_frame_shape = (480, 640, 3)

        while True:
            ok, frame = cap.read()
            if not ok:
                break

            last_frame_shape = frame.shape
            frames += 1

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(100, 100),
            )

            if len(faces):
                face = max(faces, key=lambda r: r[2] * r[3])
                smoothed_face = v2.smooth_face_box(
                    smoothed_face, face
                )
                x, y, w, h = smoothed_face
                all_face_history.append(smoothed_face)

                rois = v2.get_rois(frame, smoothed_face)
                extracted = {}

                for name, (x1, y1, x2, y2) in rois.items():
                    crop = frame[y1:y2, x1:x2]
                    if crop.size == 0:
                        continue
                    rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                    rgb = cv2.resize(
                        rgb,
                        v2.ROI_SIZE,
                        interpolation=cv2.INTER_AREA,
                    )
                    extracted[name] = rgb

                if set(buffers).issubset(extracted):
                    for name in buffers:
                        buffers[name].append(extracted[name])

                px1 = max(0, x - int(v2.FACE_PADDING * w))
                py1 = max(0, y - int(v2.FACE_PADDING * h))
                px2 = min(frame.shape[1], x + w + int(v2.FACE_PADDING * w))
                py2 = min(frame.shape[0], y + h + int(v2.FACE_PADDING * h))
                fcrop = frame[py1:py2, px1:px2]
                if fcrop.size:
                    brightness_history.append(
                        float(
                            np.mean(
                                cv2.cvtColor(fcrop, cv2.COLOR_BGR2GRAY)
                            )
                        )
                    )

        if frames == 0:
            raise RuntimeError("No frames were decoded from the recording.")

        # V2 standalone uses measured camera FPS. For a recorded browser
        # stream, use the stream's FPS metadata instead of processing speed.
        fs = video_fps

        n = min(len(v) for v in buffers.values())
        win = int(v2.WINDOW_SECONDS * fs)
        step = int(v2.STEP_SECONDS * fs)

        window_results = []
        if n >= win:
            for window_id, start_idx in enumerate(
                range(0, n - win + 1, step)
            ):
                end_idx = start_idx + win
                sub = {
                    name: vals[start_idx:end_idx]
                    for name, vals in buffers.items()
                }
                result = v2.process_window(
                    sub, fs, window_id=window_id
                )
                if result:
                    window_results.append(result)

        h, w = last_frame_shape[:2]
        motion = (
            v2.compute_motion_score(
                all_face_history, w, h
            )
            if frames
            else 0.0
        )
        lighting = v2.compute_lighting_score(brightness_history)
        final = v2.final_trust(
            window_results, motion, lighting
        )

        if final["hr"] is None:
            heart_rate = None
        else:
            heart_rate = int(round(final["hr"]))

        trust = int(round(final["trust"]))
        confidence = (
            "high" if final["accept"] and trust >= 70
            else "medium" if trust >= 40
            else "low"
        )

        return {
            "heartRate": heart_rate,
            "trustScore": trust,
            "signalQuality": int(round(final["signal"])),
            "temporalStability": int(round(final["temporal"])),
            "algorithmAgreement": int(round(final["method"])),
            "regionAgreement": int(round(final["region"])),
            "motionStability": int(round(final["motion"])),
            "lighting": int(round(final["lighting"])),
            "confidence": confidence,
            "accept": bool(final["accept"]),
            "windowHrs": [
                round(float(x), 1) for x in final["window_hrs"]
            ],
            "globalClusters": [
                {
                    "hr": round(float(c["hr"]), 1),
                    "score": round(float(c["score"]), 2),
                    "windows": len(c["windows"]),
                }
                for c in final.get("global_clusters", [])
            ],
            "methods": _method_summaries(window_results),
            "frames": frames,
            "samplingRate": round(float(fs), 2),
            "demoMode": False,
        }
    finally:
        cap.release()
        try:
            os.remove(video_path)
        except OSError:
            pass


@app.get("/health")
def health():
    return jsonify({
        "success": True,
        "service": "SwasthOne exact V2 rPPG service",
    })


@app.post("/analyze")
def analyze():
    recording = request.files.get("video")
    if recording is None:
        return jsonify({
            "success": False,
            "message": "A browser recording named 'video' is required.",
        }), 400

    try:
        result = analyze_video(recording)
        if result["heartRate"] is None:
            print("[V2 DEBUG RESULT]", result)
            return jsonify({
                "success": False,
                "message": "V2 could not obtain a usable heart-rate estimate.",
                "result": result,
            }), 422

        return jsonify({
            "success": True,
            "result": result,
        })
    except Exception as exc:
        print(f"[V2 SERVICE ERROR] {exc}")
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("RPPG_PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
