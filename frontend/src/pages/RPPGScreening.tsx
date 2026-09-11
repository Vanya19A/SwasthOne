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
import { t, useLanguage } from '../i18n'

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
  useLanguage()

  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient as Patient | undefined
  const screening =
    location.state?.screening as ScreeningData | undefined

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)

  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'requesting' | 'ready' | 'denied' | 'error'
  >('idle')

  const [isMeasuring, setIsMeasuring] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(30)
  const [measurementComplete, setMeasurementComplete] =
    useState(false)

  useEffect(() => {
    if (
      cameraStatus === 'ready' &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject = streamRef.current

      videoRef.current.play().catch((error) => {
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
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setCameraStatus('requesting')

      const stream =
        await navigator.mediaDevices.getUserMedia({
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
    if (
      cameraStatus !== 'ready' ||
      isMeasuring
    ) {
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

  const progress =
    ((30 - secondsRemaining) / 30) * 100

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

            {t('common', 'back')}
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <Camera size={24} />
            </div>

            <div>
              <p className="eyebrow">
                {t('rppg', 'eyebrow')}
              </p>

              <h1>
                {t('rppg', 'title')}
              </h1>

              <p>
                {t('rppg', 'description')}
              </p>
            </div>
          </div>
        </header>

        {/* Workflow */}
        <div className="workflow">
          <div className="workflow-step completed">
            <span>✓</span>

            <label>
              {t('screening', 'registration')}
            </label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step completed">
            <span>✓</span>

            <label>
              {t('screening', 'symptomsStep')}
            </label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step active">
            <span>3</span>

            <label>
              {t('screening', 'rppg')}
            </label>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>4</span>

            <label>
              {t('screening', 'triage')}
            </label>
          </div>
        </div>

        {patient && (
          <div className="patient-strip">
            <div>
              <span>
                {t('screening', 'screeningFor')}
              </span>

              <strong>{patient.name}</strong>
            </div>

            <div>
              <span>
                {t('screening', 'age')}
              </span>

              <strong>
                {patient.age || '—'}
              </strong>
            </div>

            <div>
              <span>
                {t('screening', 'village')}
              </span>

              <strong>
                {patient.village || '—'}
              </strong>
            </div>
          </div>
        )}

        <div className="rppg-layout">
          {/* Camera */}
          <section className="rppg-camera-card">
            <div className="rppg-camera-header">
              <div>
                <p className="section-kicker">
                  {t('rppg', 'cameraTitle')}
                </p>

                <h2>
                  {t(
                    'rppg',
                    'positionFace',
                  )}
                </h2>
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
                  ? t(
                      'rppg',
                      'cameraReady',
                    )
                  : t(
                      'rppg',
                      'cameraNotStarted',
                    )}
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
                        {secondsRemaining}
                        {t('rppg', 'secondsShort')}
                      </div>

                      <p>
                        {t(
                          'rppg',
                          'stayStill',
                        )}
                      </p>
                    </div>
                  )}

                  {measurementComplete && (
                    <div className="measurement-complete">
                      <CheckCircle2 size={42} />

                      <strong>
                        {t(
                          'rppg',
                          'recordingComplete',
                        )}
                      </strong>

                      <span>
                        {t(
                          'rppg',
                          'signalCaptured',
                        )}
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
                    {t(
                      'rppg',
                      'cameraScreening',
                    )}
                  </h3>

                  <p>
                    {t(
                      'rppg',
                      'cameraAccessDescription',
                    )}
                  </p>

                  {cameraStatus === 'denied' && (
                    <div className="camera-error">
                      <Info size={16} />

                      <span>
                        {t(
                          'rppg',
                          'cameraPermission',
                        )}
                      </span>
                    </div>
                  )}

                  {cameraStatus === 'requesting' && (
                    <p className="camera-requesting">
                      {t(
                        'rppg',
                        'requestingCamera',
                      )}
                    </p>
                  )}

                  {cameraStatus === 'idle' && (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={startCamera}
                    >
                      <Camera size={18} />

                      {t(
                        'rppg',
                        'enableCamera',
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {cameraStatus === 'ready' &&
              !isMeasuring &&
              !measurementComplete && (
                <button
                  className="primary-button rppg-start-button"
                  type="button"
                  onClick={startMeasurement}
                >
                  <Camera size={18} />

                  {t(
                    'rppg',
                    'start',
                  )}
                </button>
              )}

            {isMeasuring && (
              <div className="measurement-progress">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <span>
                  {secondsRemaining}{' '}
                  {t(
                    'rppg',
                    'secondsRemaining',
                  )}
                </span>
              </div>
            )}

            {measurementComplete && (
              <div className="capture-success">
                <CheckCircle2 size={20} />

                <div>
                  <strong>
                    {t(
                      'rppg',
                      'measurementCaptured',
                    )}
                  </strong>

                  <span>
                    {t(
                      'rppg',
                      'qualityAnalysisNext',
                    )}
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

                <h3>
                  {t(
                    'rppg',
                    'betterReading',
                  )}
                </h3>
              </div>

              <ul className="rppg-tips">
                <li>
                  <CheckCircle2 size={17} />

                  <span>
                    {t(
                      'rppg',
                      'tipFaceCamera',
                    )}
                  </span>
                </li>

                <li>
                  <CheckCircle2 size={17} />

                  <span>
                    {t(
                      'rppg',
                      'tipKeepStill',
                    )}
                  </span>
                </li>

                <li>
                  <CheckCircle2 size={17} />

                  <span>
                    {t(
                      'rppg',
                      'tipLighting',
                    )}
                  </span>
                </li>

                <li>
                  <CheckCircle2 size={17} />

                  <span>
                    {t(
                      'rppg',
                      'tipFaceVisible',
                    )}
                  </span>
                </li>
              </ul>
            </section>

            <section className="rppg-info-card safety-card">
              <div className="rppg-info-title">
                <ShieldCheck size={19} />

                <h3>
                  {t(
                    'rppg',
                    'whyQualityMatters',
                  )}
                </h3>
              </div>

              <p>
                {t(
                  'rppg',
                  'qualityDescription',
                )}
              </p>
            </section>

            <section className="rppg-info-card">
              <div className="rppg-info-title">
                <Lightbulb size={19} />

                <h3>
                  {t(
                    'rppg',
                    'whatNext',
                  )}
                </h3>
              </div>

              <div className="next-flow">
                <span>1</span>

                <p>
                  {t(
                    'rppg',
                    'stepCapture',
                  )}
                </p>

                <span>2</span>

                <p>
                  {t(
                    'rppg',
                    'stepQuality',
                  )}
                </p>

                <span>3</span>

                <p>
                  {t(
                    'rppg',
                    'stepTrustScore',
                  )}
                </p>
              </div>
            </section>

            <div className="rppg-disclaimer">
              <Info size={16} />

              <p>
                <strong>
                  {t(
                    'rppg',
                    'safetyTitle',
                  )}
                </strong>{' '}

                {t(
                  'rppg',
                  'safetyText',
                )}
              </p>
            </div>
          </aside>
        </div>

        <div className="form-footer rppg-footer">
          <p>
            {t(
              'rppg',
              'recordingNote',
            )}
          </p>

          <button
            className="primary-button"
            type="button"
            disabled={!measurementComplete}
            onClick={handleContinue}
          >
            {t(
              'rppg',
              'checkTrustScore',
            )}

            <ArrowRight size={18} />
          </button>
        </div>

        {measurementComplete && (
          <div className="prototype-note">
            <Info size={16} />

            <span>
              {t(
                'rppg',
                'prototypeNote',
              )}
            </span>
          </div>
        )}
      </main>
    </div>
  )
}

export default RPPGScreening