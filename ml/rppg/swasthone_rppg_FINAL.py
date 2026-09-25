"""
SwasthOne rPPG FINAL DEMO PIPELINE

Camera -> face tracking -> 3 facial ROIs -> POS + CHROM
-> 15-second sliding windows -> spectral consensus
-> temporal stability -> TrustScore -> ACCEPT / RETAKE

This is a prototype screening/demo implementation, NOT a clinically
validated diagnostic measurement. TrustScore is measurement-quality
confidence, not a medical risk score.
"""

import time
from collections import defaultdict

import cv2
import numpy as np
from scipy.signal import butter, filtfilt

from unsupervised_methods.methods.POS_WANG import POS_WANG
from unsupervised_methods.methods.CHROME_DEHAAN import CHROME_DEHAAN


# ============================================================
# SETTINGS
# ============================================================

CAMERA_INDEX = 0
DURATION_SECONDS = 30
ROI_SIZE = (72, 72)

MIN_HR = 45.0
MAX_HR = 140.0

WINDOW_SECONDS = 15.0
STEP_SECONDS = 5.0

FACE_SMOOTHING = 0.25
FACE_PADDING = 0.12

TRUST_THRESHOLD = 70.0

# ------------------------------------------------------------
# These are prototype quality thresholds, not clinical limits.
# ------------------------------------------------------------
METHOD_TOLERANCE = 8.0
REGION_TOLERANCE = 8.0


# ============================================================
# BASIC HELPERS
# ============================================================

def clamp01(x):
    return float(np.clip(x, 0.0, 1.0))


def smooth_face_box(previous, current, alpha=FACE_SMOOTHING):
    if previous is None:
        return tuple(current)
    return tuple(
        int(alpha * c + (1.0 - alpha) * p)
        for p, c in zip(previous, current)
    )


def bandpass(signal, fs, low=0.65, high=3.0, order=3):
    signal = np.asarray(signal, dtype=np.float64).flatten()
    if len(signal) < max(30, order * 8):
        return signal

    nyq = fs / 2.0
    high = min(high, nyq * 0.90)
    low = max(low, 0.05)
    if low >= high:
        return signal - np.mean(signal)

    b, a = butter(order, [low / nyq, high / nyq], btype="band")
    try:
        return filtfilt(b, a, signal)
    except Exception:
        return signal - np.mean(signal)


# ============================================================
# ROBUST SPECTRAL HR ESTIMATION
# ============================================================

def spectral_profile(bvp, fs):
    """Return interpolated normalized spectral power on a common HR grid."""
    bvp = np.asarray(bvp, dtype=np.float64).flatten()
    if len(bvp) < int(fs * 10):
        return None

    bvp = bvp - np.mean(bvp)
    bvp = bandpass(bvp, fs)

    if np.std(bvp) < 1e-8:
        return None

    # Zero padding improves peak localization without pretending to add data.
    nfft = max(4096, 2 ** int(np.ceil(np.log2(len(bvp) * 8))))
    window = np.hanning(len(bvp))
    spec = np.abs(np.fft.rfft(bvp * window, n=nfft)) ** 2
    freqs = np.fft.rfftfreq(nfft, 1.0 / fs)

    valid = (freqs >= MIN_HR / 60.0) & (freqs <= MAX_HR / 60.0)
    freqs = freqs[valid]
    spec = spec[valid]

    if len(spec) < 10 or np.max(spec) <= 0:
        return None

    hr_grid = np.arange(MIN_HR, MAX_HR + 0.01, 0.5)
    power = np.interp(hr_grid / 60.0, freqs, spec)

    # Mild smoothing in the HR domain.
    kernel = np.ones(5, dtype=np.float64) / 5.0
    power = np.convolve(power, kernel, mode="same")

    power = np.maximum(power, 0)
    total = float(np.sum(power)) + 1e-12
    norm = power / total

    return hr_grid, norm


def estimate_from_profile(hr_grid, power):
    """Select a pulse peak while allowing a second harmonic to support it."""
    if hr_grid is None or power is None:
        return None, 0.0, 0.0

    # Candidate local maxima.
    peaks = []
    for i in range(2, len(power) - 2):
        if power[i] >= power[i - 1] and power[i] >= power[i + 1]:
            peaks.append(i)

    if not peaks:
        peaks = [int(np.argmax(power))]

    # Score a fundamental with its possible 2nd harmonic.
    scored = []
    for i in peaks:
        hr = float(hr_grid[i])
        base = float(power[i])

        harmonic = 0.0
        target = 2.0 * hr
        if target <= MAX_HR:
            j = int(np.argmin(np.abs(hr_grid - target)))
            harmonic = float(power[j])

        # Also mildly reward support immediately around the peak.
        lo = max(0, i - 2)
        hi = min(len(power), i + 3)
        local = float(np.sum(power[lo:hi]))

        score = base + 0.30 * harmonic + 0.20 * local
        scored.append((score, i, base, harmonic))

    scored.sort(reverse=True)
    _, best_i, base_power, harmonic_power = scored[0]

    hr = float(hr_grid[best_i])

    # Spectral concentration around selected fundamental.
    lo = max(0, best_i - 5)
    hi = min(len(power), best_i + 6)
    peak_energy = float(np.sum(power[lo:hi]))

    # Relative prominence against the rest of the spectrum.
    rest = float(np.sum(power)) - peak_energy
    snr_like = 10.0 * np.log10((peak_energy + 1e-12) / (rest / max(1, len(power) - (hi - lo)) + 1e-12))

    return hr, float(snr_like), float(base_power)


# ============================================================
# FACE / ROI
# ============================================================

def get_rois(frame, face):
    x, y, w, h = face

    candidates = {
        # Central forehead is generally a clean skin region.
        "Forehead": (
            x + int(0.18 * w),
            y + int(0.06 * h),
            x + int(0.82 * w),
            y + int(0.30 * h),
        ),
        # Cheeks provide independent spatial confirmation.
        "Left Cheek": (
            x + int(0.10 * w),
            y + int(0.50 * h),
            x + int(0.43 * w),
            y + int(0.76 * h),
        ),
        "Right Cheek": (
            x + int(0.57 * w),
            y + int(0.50 * h),
            x + int(0.90 * w),
            y + int(0.76 * h),
        ),
    }

    height, width = frame.shape[:2]
    rois = {}

    for name, (x1, y1, x2, y2) in candidates.items():
        x1 = max(0, min(x1, width - 1))
        x2 = max(1, min(x2, width))
        y1 = max(0, min(y1, height - 1))
        y2 = max(1, min(y2, height))
        if x2 > x1 and y2 > y1:
            rois[name] = (x1, y1, x2, y2)

    return rois


# ============================================================
# WINDOW PROCESSING
# ============================================================

def process_window(region_buffers, fs):
    """Process one temporal window using POS + CHROM across 3 ROIs."""
    profiles = []
    individual = []

    for region, frames in region_buffers.items():
        data = np.asarray(frames, dtype=np.float64)
        if len(data) < int(fs * 10):
            continue

        methods = [
            ("POS", lambda: POS_WANG(data, fs)),
            ("CHROM", lambda: CHROME_DEHAAN(data, fs)),
        ]

        for method_name, fn in methods:
            try:
                bvp = fn()
                profile = spectral_profile(bvp, fs)
                if profile is None:
                    continue

                hr_grid, power = profile
                hr, snr_like, peak_power = estimate_from_profile(hr_grid, power)
                if hr is None:
                    continue

                profiles.append((region, method_name, hr_grid, power))
                individual.append({
                    "region": region,
                    "method": method_name,
                    "hr": hr,
                    "snr": snr_like,
                    "peak_power": peak_power,
                })
            except Exception as exc:
                print(f"[WARN] {region}/{method_name}: {exc}")

    if not profiles:
        return None

    # Median spectral consensus: unlike a simple HR vote, this uses the
    # entire spectrum and is robust to one bad ROI/method.
    matrix = np.vstack([p[3] for p in profiles])
    median_power = np.median(matrix, axis=0)
    median_power = median_power / (np.sum(median_power) + 1e-12)

    consensus_hr, consensus_snr, _ = estimate_from_profile(
        profiles[0][2], median_power
    )

    # Individual estimates supporting the consensus.
    method_support = []
    region_support = defaultdict(list)
    for item in individual:
        close = abs(item["hr"] - consensus_hr) <= METHOD_TOLERANCE
        method_support.append(close)
        if close:
            region_support[item["region"]].append(item["hr"])

    method_agreement = 100.0 * np.mean(method_support) if method_support else 0.0
    region_agreement = 100.0 * len(region_support) / 3.0

    # Spectral concentration: how much energy is concentrated around the
    # selected pulse frequency rather than spread across the band.
    idx = int(np.argmin(np.abs(profiles[0][2] - consensus_hr)))
    lo = max(0, idx - 5)
    hi = min(len(median_power), idx + 6)
    concentration = float(np.sum(median_power[lo:hi]))

    # Convert to a readable 0..100 quality measure.
    # ~0.10 is weak; ~0.25+ is substantially more concentrated.
    spectral_quality = 100.0 * clamp01((concentration - 0.06) / 0.22)

    return {
        "hr": float(consensus_hr),
        "spectral_quality": float(spectral_quality),
        "snr": float(consensus_snr),
        "method_agreement": float(method_agreement),
        "region_agreement": float(region_agreement),
        "individual": individual,
        "profiles": profiles,
    }


# ============================================================
# GLOBAL TRUST SCORE
# ============================================================

def compute_motion_score(face_history, frame_width, frame_height):
    if len(face_history) < 3:
        return 0.0

    centers = np.array([
        [
            (x + w / 2) / frame_width,
            (y + h / 2) / frame_height,
        ]
        for x, y, w, h in face_history
    ])

    movement = np.mean(np.linalg.norm(np.diff(centers, axis=0), axis=1))
    return 100.0 * clamp01(1.0 - movement * 35.0)


def compute_lighting_score(brightness):
    if len(brightness) < 3:
        return 0.0
    b = np.asarray(brightness, dtype=np.float64)
    mean = float(np.mean(b))
    if mean <= 1:
        return 0.0
    cv = float(np.std(b) / mean)
    return 100.0 * clamp01(1.0 - cv * 5.0)


def weighted_median(values, weights):
    values = np.asarray(values, dtype=float)
    weights = np.asarray(weights, dtype=float)
    order = np.argsort(values)
    values = values[order]
    weights = weights[order]
    c = np.cumsum(weights)
    return float(values[np.searchsorted(c, c[-1] / 2.0)])


def final_trust(window_results, motion_score, lighting_score):
    if not window_results:
        return {
            "hr": None, "trust": 0.0, "signal": 0.0,
            "temporal": 0.0, "method": 0.0, "region": 0.0,
            "motion": motion_score, "lighting": lighting_score,
            "accept": False,
        }

    hrs = np.array([w["hr"] for w in window_results], dtype=float)
    weights = np.array([
        max(0.1, w["spectral_quality"] / 100.0)
        * max(0.25, w["method_agreement"] / 100.0)
        for w in window_results
    ])

    final_hr = weighted_median(hrs, weights)

    # Temporal stability: repeated windows should remain close.
    spread = float(np.std(hrs))
    temporal = 100.0 * clamp01(np.exp(-spread / 8.0))

    signal = float(np.average(
        [w["spectral_quality"] for w in window_results],
        weights=weights,
    ))
    method = float(np.average(
        [w["method_agreement"] for w in window_results],
        weights=weights,
    ))
    region = float(np.average(
        [w["region_agreement"] for w in window_results],
        weights=weights,
    ))

    # Final quality score deliberately rewards repeated stable measurements.
    trust = (
        0.30 * signal
        + 0.25 * temporal
        + 0.20 * region
        + 0.15 * method
        + 0.05 * motion_score
        + 0.05 * lighting_score
    )

    # Do not accept a measurement merely because motion/lighting are good.
    accept = (
        trust >= TRUST_THRESHOLD
        and temporal >= 60.0
        and signal >= 45.0
        and method >= 50.0
        and region >= 66.0
    )

    return {
        "hr": final_hr,
        "trust": float(np.clip(trust, 0, 100)),
        "signal": signal,
        "temporal": temporal,
        "method": method,
        "region": region,
        "motion": motion_score,
        "lighting": lighting_score,
        "accept": accept,
        "window_hrs": hrs.tolist(),
    }


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 72)
    print("SwasthOne rPPG - FINAL DEMO PIPELINE")
    print("POS + CHROM | 3 ROIs | Temporal Spectral Consensus")
    print("=" * 72)
    print("Keep your face centered, still and evenly illuminated.")
    print("Measurement duration: 30 seconds")
    print("Press Q to stop early.\n")

    cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    if cascade.empty():
        raise RuntimeError("Could not load face detector.")

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        raise RuntimeError("Could not open webcam.")

    cap.set(cv2.CAP_PROP_FPS, 30)

    buffers = {"Forehead": [], "Left Cheek": [], "Right Cheek": []}
    all_face_history = []
    brightness_history = []
    smoothed_face = None

    start = time.time()
    frames = 0

    while time.time() - start < DURATION_SECONDS:
        ok, frame = cap.read()
        if not ok:
            continue

        frames += 1
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100)
        )

        if len(faces):
            face = max(faces, key=lambda r: r[2] * r[3])
            smoothed_face = smooth_face_box(smoothed_face, face)
            x, y, w, h = smoothed_face
            all_face_history.append(smoothed_face)

            rois = get_rois(frame, smoothed_face)
            extracted = {}

            for name, (x1, y1, x2, y2) in rois.items():
                crop = frame[y1:y2, x1:x2]
                if crop.size == 0:
                    continue
                rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                rgb = cv2.resize(rgb, ROI_SIZE, interpolation=cv2.INTER_AREA)
                extracted[name] = rgb

            if set(buffers).issubset(extracted):
                for name in buffers:
                    buffers[name].append(extracted[name])

            # Lighting signal from the complete tracked face.
            px1 = max(0, x - int(FACE_PADDING * w))
            py1 = max(0, y - int(FACE_PADDING * h))
            px2 = min(frame.shape[1], x + w + int(FACE_PADDING * w))
            py2 = min(frame.shape[0], y + h + int(FACE_PADDING * h))
            fcrop = frame[py1:py2, px1:px2]
            if fcrop.size:
                brightness_history.append(
                    float(np.mean(cv2.cvtColor(fcrop, cv2.COLOR_BGR2GRAY)))
                )

            # UI overlays.
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            for name, (x1, y1, x2, y2) in rois.items():
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 165, 255), 2)

        remaining = max(0.0, DURATION_SECONDS - (time.time() - start))
        cv2.putText(frame, f"rPPG scan: {remaining:04.1f}s", (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(frame, "Keep face still | Q = stop", (20, 65),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.imshow("SwasthOne - rPPG Scan", frame)

        if (cv2.waitKey(1) & 0xFF) == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    elapsed = max(0.1, time.time() - start)
    fs = frames / elapsed

    print(f"\nCaptured frames : {frames}")
    print(f"Elapsed time    : {elapsed:.2f} s")
    print(f"Measured FPS    : {fs:.2f}")
    print("Region samples:")
    for name, vals in buffers.items():
        print(f"  {name:<12}: {len(vals)}")

    # Build overlapping 15-second windows.
    n = min(len(v) for v in buffers.values())
    win = int(WINDOW_SECONDS * fs)
    step = int(STEP_SECONDS * fs)

    window_results = []
    if n >= win:
        for start_idx in range(0, n - win + 1, step):
            end_idx = start_idx + win
            sub = {name: vals[start_idx:end_idx] for name, vals in buffers.items()}
            result = process_window(sub, fs)
            if result:
                window_results.append(result)
                print(
                    f"Window {start_idx/fs:04.1f}-{end_idx/fs:04.1f}s: "
                    f"HR={result['hr']:.1f} | "
                    f"signal={result['spectral_quality']:.0f} | "
                    f"method={result['method_agreement']:.0f} | "
                    f"region={result['region_agreement']:.0f}"
                )

    motion = compute_motion_score(
        all_face_history, frame.shape[1], frame.shape[0]
    ) if frames else 0.0
    lighting = compute_lighting_score(brightness_history)

    final = final_trust(window_results, motion, lighting)

    print("\n" + "=" * 72)
    print("SWASTHONE FINAL rPPG RESULT")
    print("=" * 72)
    if final["hr"] is None:
        print("Heart Rate          : N/A")
    else:
        print(f"Heart Rate          : {final['hr']:.0f} BPM")
    print(f"Signal Quality      : {final['signal']:.0f}/100")
    print(f"Temporal Stability  : {final['temporal']:.0f}/100")
    print(f"Method Agreement    : {final['method']:.0f}/100")
    print(f"Region Agreement    : {final['region']:.0f}/100")
    print(f"Motion Stability    : {final['motion']:.0f}/100")
    print(f"Lighting Stability  : {final['lighting']:.0f}/100")
    print(f"TrustScore          : {final['trust']:.0f}/100")
    print(f"Decision            : {'ACCEPT' if final['accept'] else 'RETAKE'}")
    print("=" * 72)

    if final["window_hrs"]:
        print("Window HRs:", ", ".join(f"{x:.1f}" for x in final["window_hrs"]))

    print("\nInterpretation: TrustScore represents confidence in the camera measurement")
    print("quality, not a diagnosis or a judgement about the user's health.")


if __name__ == "__main__":
    main()
