import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

interface Patient {
  name: string
  age: string
  gender: string
  phone: string
  village: string
  emergencyContact: string
}

interface ScreeningData {
  symptoms: string[]
  duration: string
  severity: string
  hasManualVitals: boolean
  bloodPressure: string
  pulse: string
  temperature: string
  oxygenSaturation: string
}

function RPPGScreening() {
  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient as Patient | undefined
  const screening = location.state?.screening as ScreeningData | undefined

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)

  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'requesting' | 'ready' | 'denied' | 'error'
  >('idle')

  const [isMeasuring, setIsMeasuring] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(30)
  const [measurementComplete, setMeasurementComplete] = useState(false)

  useEffect(() => {
  if (cameraStatus === 'ready' && videoRef.current && streamRef.current) {
    videoRef.current.srcObject = streamRef.current

    videoRef.current
      .play()
      .catch((error) => {
        console.error('Video playback error:', error)
      })
  }
}, [cameraStatus])

   useEffect(() => {
    return () => {
        if (timerRef.current) {
        window.clearInterval(timerRef.current)
        }

        if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        }
    }
  }, [])

  const startCamera = async () => {
  try {
    setCameraStatus('requesting')

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    streamRef.current = stream

    setCameraStatus('ready')
  } catch (error) {
    console.error('Camera access error:', error)
    setCameraStatus('denied')
  }
}
  

  const startMeasurement = () => {
    if (cameraStatus !== 'ready' || isMeasuring) {
      return
    }

    setIsMeasuring(true)
    setMeasurementComplete(false)
    setSecondsRemaining(30)

    let remaining = 30

    timerRef.current = window.setInterval(() => {
      remaining -= 1
      setSecondsRemaining(remaining)

      if (remaining <= 0) {
        if (timerRef.current) {
          window.clearInterval(timerRef.current)
        }

        setIsMeasuring(false)
        setMeasurementComplete(true)
      }
    }, 1000)
  }

  const handleBack = () => {
    navigate('/screening', {
      state: {
        patient,
      },
    })
  }

  const handleContinue = () => {
    navigate('/screening/trustscore', {
      state: {
        patient,
        screening,
        measurement: {
          captured: true,
          demoMode: true,
        },
      },
    })
  }

  const progress = ((30 - secondsRemaining) / 30) * 100

  return (
    <div className="page-shell">
      <main className="rppg-page">
        <header className="form-header">
          <button
            className="back-button"
            type="button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <Camera size={24} />
            </div>

            <div>
              <p className="eyebrow">Camera-based screening</p>

              <h1>Let's take a quick health screening.</h1>

              <p>
                Keep your face still and follow the on-screen instructions
                while the camera records your facial signal.
              </p>
            </div>
          </div>
        </header>

        {/* Workflow */}
        <div className="workflow">
          <div className="workflow-step completed">
            <span>✓</span>
            <label>Registration</label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step completed">
            <span>✓</span>
            <label>Symptoms</label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step active">
            <span>3</span>
            <label>rPPG</label>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>4</span>
            <label>Triage</label>
          </div>
        </div>

        {patient && (
          <div className="patient-strip">
            <div>
              <span>Screening for</span>
              <strong>{patient.name}</strong>
            </div>

            <div>
              <span>Age</span>
              <strong>{patient.age || '—'}</strong>
            </div>

            <div>
              <span>Village</span>
              <strong>{patient.village || '—'}</strong>
            </div>
          </div>
        )}

        <div className="rppg-layout">
          {/* Camera */}
          <section className="rppg-camera-card">
            <div className="rppg-camera-header">
              <div>
                <p className="section-kicker">30-SECOND SCREENING</p>
                <h2>Position your face inside the frame</h2>
              </div>

              <div className="camera-status">
                <span
                  className={`status-dot ${
                    cameraStatus === 'ready'
                      ? 'ready'
                      : cameraStatus === 'denied'
                        ? 'error'
                        : ''
                  }`}
                />
                {cameraStatus === 'ready'
                  ? 'Camera ready'
                  : 'Camera not started'}
              </div>
            </div>

            <div className="camera-preview">
              {cameraStatus === 'ready' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                  />

                  <div className="face-guide">
                    <div className="face-guide-corner top-left" />
                    <div className="face-guide-corner top-right" />
                    <div className="face-guide-corner bottom-left" />
                    <div className="face-guide-corner bottom-right" />
                  </div>

                  {isMeasuring && (
                    <div className="measurement-overlay">
                      <div className="measurement-timer">
                        {secondsRemaining}s
                      </div>

                      <p>
                        Stay still and keep your face inside the frame
                      </p>
                    </div>
                  )}

                  {measurementComplete && (
                    <div className="measurement-complete">
                      <CheckCircle2 size={42} />

                      <strong>Recording complete</strong>

                      <span>
                        Your signal has been captured for quality analysis.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="camera-placeholder">
                  <div className="camera-placeholder-icon">
                    <Camera size={34} />
                  </div>

                  <h3>
                    Camera screening
                  </h3>

                  <p>
                    Camera access is needed for the 30-second facial signal
                    recording.
                  </p>

                  {cameraStatus === 'denied' && (
                    <div className="camera-error">
                      <Info size={16} />
                      <span>
                        Camera access was not granted. Please allow camera
                        permission in your browser.
                      </span>
                    </div>
                  )}

                  {cameraStatus === 'requesting' && (
                    <p className="camera-requesting">
                      Requesting camera access…
                    </p>
                  )}

                  {cameraStatus === 'idle' && (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={startCamera}
                    >
                      <Camera size={18} />
                      Enable camera
                    </button>
                  )}
                </div>
              )}
            </div>

            {cameraStatus === 'ready' && !isMeasuring && !measurementComplete && (
              <button
                className="primary-button rppg-start-button"
                type="button"
                onClick={startMeasurement}
              >
                <Camera size={18} />
                Start 30-second screening
              </button>
            )}

            {isMeasuring && (
              <div className="measurement-progress">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span>
                  {secondsRemaining} seconds remaining
                </span>
              </div>
            )}

            {measurementComplete && (
              <div className="capture-success">
                <CheckCircle2 size={20} />
                <div>
                  <strong>Measurement captured</strong>
                  <span>
                    Next, we will check whether the signal is reliable enough
                    to use.
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Instructions */}
          <aside className="rppg-info-column">
            <section className="rppg-info-card">
              <div className="rppg-info-title">
                <UserRound size={19} />
                <h3>For a better reading</h3>
              </div>

              <ul className="rppg-tips">
                <li>
                  <CheckCircle2 size={17} />
                  <span>Face the camera directly.</span>
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  <span>Keep your head as still as possible.</span>
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  <span>Use a well-lit environment.</span>
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  <span>Keep your whole face visible.</span>
                </li>
              </ul>
            </section>

            <section className="rppg-info-card safety-card">
              <div className="rppg-info-title">
                <ShieldCheck size={19} />
                <h3>Why signal quality matters</h3>
              </div>

              <p>
                Camera-based measurements can be affected by movement,
                lighting and signal quality. SwasthOne checks measurement
                confidence before using the result.
              </p>
            </section>

            <section className="rppg-info-card">
              <div className="rppg-info-title">
                <Lightbulb size={19} />
                <h3>What happens next?</h3>
              </div>

              <div className="next-flow">
                <span>1</span>
                <p>Capture facial signal</p>

                <span>2</span>
                <p>Check signal quality</p>

                <span>3</span>
                <p>Calculate TrustScore</p>
              </div>
            </section>

            <div className="rppg-disclaimer">
              <Info size={16} />

              <p>
                <strong>Screening support only.</strong> rPPG results are not
                a diagnosis and should not replace clinically validated
                measurements or professional medical advice.
              </p>
            </div>
          </aside>
        </div>

        <div className="form-footer rppg-footer">
          <p>
            Your camera recording is used for this screening step.
          </p>

          <button
            className="primary-button"
            type="button"
            disabled={!measurementComplete}
            onClick={handleContinue}
          >
            Check TrustScore
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Development note */}
        {measurementComplete && (
          <div className="prototype-note">
            <Info size={16} />
            <span>
              Frontend capture is ready. The real rPPG signal-processing
              service will provide HR, HRV, respiratory-rate information and
              TrustScore in the integration step.
            </span>
          </div>
        )}
      </main>
    </div>
  )
}

export default RPPGScreening