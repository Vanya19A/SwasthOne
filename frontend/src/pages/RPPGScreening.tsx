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
import { apiFetch } from '../services/api'

interface Patient {
  name: string
  age: string
  gender: string
  phone: string
  village: string
  emergencyContact: string
}

interface ScreeningData {
  _id?: string
  patientId?: string
  symptoms: string[]
  duration: string
  severity: string
  hasManualVitals: boolean
  bloodPressure: string
  pulse: string
  temperature: string
  oxygenSaturation: string
}

interface V2Result {
  heartRate: number | null
  trustScore: number
  signalQuality: number
  temporalStability: number
  algorithmAgreement: number
  regionAgreement: number
  motionStability: number
  lighting: number
  confidence: 'high' | 'medium' | 'low'
  accept: boolean
  windowHrs: number[]
  globalClusters: { hr: number; score: number; windows: number }[]
  methods: { method: string; heartRate: number | null }[]
  frames: number
  samplingRate: number
  demoMode: boolean
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
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const [analysis, setAnalysis] = useState<V2Result | null>(null)
  const [analysisReady, setAnalysisReady] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'requesting' | 'ready' | 'denied' | 'error'
  >('idle')

  const [isMeasuring, setIsMeasuring] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(30)
  const [measurementComplete, setMeasurementComplete] =
    useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  const getRecordingMimeType = () => {
    const candidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ]
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
  }

  const analyzeRecording = async (blob: Blob) => {
    setAnalyzing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('video', blob, 'swasthone-rppg-v2.webm')

      const serviceUrl =
        import.meta.env.VITE_RPPG_API_URL || 'http://localhost:8000'

      const response = await fetch(`${serviceUrl}/analyze`, {
        method: 'POST',
        body: formData,
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message ||
            'The V2 rPPG service could not process the recording.',
        )
      }

      setAnalysis(payload.result as V2Result)
      setAnalysisReady(
        Boolean(payload.result?.heartRate !== null && payload.result?.accept),
      )
    } catch (error) {
      console.error('V2 rPPG analysis error:', error)
      setAnalysisReady(false)
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to analyse the rPPG recording.',
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const startMeasurement = () => {
    if (cameraStatus !== 'ready' || isMeasuring || analyzing) return

    const stream = streamRef.current
    if (!stream) return

    const mimeType = getRecordingMimeType()
    if (!mimeType) {
      setError('This browser does not support the required camera recording format.')
      return
    }

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_500_000,
      })

      recordingChunksRef.current = []
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: mimeType })
        recordingChunksRef.current = []
        recorderRef.current = null
        void analyzeRecording(blob)
      }

      setAnalysis(null)
      setAnalysisReady(false)
      setError('')
      setIsMeasuring(true)
      setMeasurementComplete(false)
      setSecondsRemaining(30)

      recorder.start(1000)

      let remaining = 30
      timerRef.current = window.setInterval(() => {
        remaining -= 1
        setSecondsRemaining(remaining)

        if (remaining <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          timerRef.current = null
          setIsMeasuring(false)
          setMeasurementComplete(true)

          if (recorder.state !== 'inactive') {
            recorder.stop()
          }
        }
      }, 1000)
    } catch (error) {
      console.error('Unable to start rPPG recording:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to start the camera recording.',
      )
    }
  }

  const handleBack = () => {
    navigate('/screening', {
      state: {
        patient,
      },
    })
  }

  const handleContinue = async () => {
    if (!screening) {
      setError('Screening data is missing. Please go back and repeat the screening.')
      return
    }

    if (!analysis || !analysisReady || analysis.heartRate === null || !analysis.accept) {
      setError('The V2 camera signal did not meet the required quality checks. Please retake the measurement.')
      return
    }

    setSaving(true)
    setError('')

    const rppgResult = {
      heartRate: analysis.heartRate,
      motion: analysis.motionStability,
      trustScore: analysis.trustScore,
      confidence: analysis.confidence,
      algorithmAgreement: analysis.algorithmAgreement,
      signalQuality: analysis.signalQuality,
      lighting: analysis.lighting,
      methods: analysis.methods.map((method) => ({
        method: method.method,
        ...(method.heartRate !== null ? { heartRate: method.heartRate } : {}),
      })),
      temporalStability: analysis.temporalStability,
      regionAgreement: analysis.regionAgreement,
      accept: analysis.accept,
      windowHrs: analysis.windowHrs,
      globalClusters: analysis.globalClusters,
      demoMode: false,
    }

    const trustScoreState = { patient, screening, rppg: rppgResult }

    setSaving(false)
    navigate('/screening/trustscore', { state: trustScoreState })

    if (!screening._id || !navigator.onLine) return

    try {
      await apiFetch('/rppg', {
        method: 'POST',
        body: JSON.stringify({
          screeningId: screening._id,
          hr: rppgResult.heartRate,
          ...rppgResult,
        }),
      })
    } catch (err) {
      console.warn('Unable to persist rPPG result in background:', err)
    }
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

        {error && <p role="alert" className="form-error">{error}</p>}

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


            {isMeasuring && (
              <div className="rppg-live-metrics">
                <div><span>V2 capture</span><strong>{secondsRemaining}s</strong></div>
                <div><span>Processing</span><strong>7-method</strong></div>
                <div><span>Camera</span><strong>30 FPS target</strong></div>
              </div>
            )}

            {analyzing && (
              <div className="rppg-live-metrics">
                <div><span>V2 engine</span><strong>Processing…</strong></div>
                <div><span>Face tracking</span><strong>Running</strong></div>
                <div><span>Consensus</span><strong>Calculating</strong></div>
              </div>
            )}

            {cameraStatus === 'ready' &&
              !isMeasuring &&
              !analyzing &&
              (!measurementComplete || !analysis?.accept) && (
                <button
                  className="primary-button rppg-start-button"
                  type="button"
                  onClick={startMeasurement}
                >
                  <Camera size={18} />
                  {analysis && !analysis.accept
                    ? 'Retake measurement'
                    : t('rppg', 'start')}
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
                    {analyzing
                      ? 'Running the exact V2 analysis…'
                      : analysis
                        ? 'V2 analysis complete. Review the measurement quality.'
                        : 'Recording captured. Starting V2 analysis…'}
                  </span>
                </div>
              </div>
            )}
          </section>

          {analysis && (
            <section className="rppg-technical-card">
              <div className="technical-header">
                <div>
                  <p className="section-kicker">Measurement details</p>
                  <h2>Exact V2 rPPG result</h2>
                </div>
                <span className="technical-badge">
                  7-method consensus
                </span>
              </div>

              <div className="result-metrics">
                <div className="result-metric">
                  <div className="metric-icon"><Camera size={21} /></div>
                  <div>
                    <span>Heart rate</span>
                    <strong>{analysis.heartRate ?? '—'}</strong>
                    <small>bpm</small>
                  </div>
                </div>
                <div className="result-metric">
                  <div className="metric-icon"><ShieldCheck size={21} /></div>
                  <div>
                    <span>TrustScore</span>
                    <strong>{analysis.trustScore}</strong>
                    <small>/100</small>
                  </div>
                </div>
                <div className="result-metric">
                  <div className="metric-icon"><CheckCircle2 size={21} /></div>
                  <div>
                    <span>Decision</span>
                    <strong>{analysis.accept ? 'ACCEPT' : 'RETAKE'}</strong>
                    <small>V2</small>
                  </div>
                </div>
              </div>

              <div className="quality-grid">
                <div className="quality-item"><div className="quality-indicator good" /><div><span>Signal quality</span><strong>{analysis.signalQuality}%</strong></div></div>
                <div className="quality-item"><div className="quality-indicator good" /><div><span>Temporal stability</span><strong>{analysis.temporalStability}%</strong></div></div>
                <div className="quality-item"><div className="quality-indicator good" /><div><span>Method agreement</span><strong>{analysis.algorithmAgreement}%</strong></div></div>
                <div className="quality-item"><div className="quality-indicator good" /><div><span>Region agreement</span><strong>{analysis.regionAgreement}%</strong></div></div>
                <div className="quality-item"><div className="quality-indicator good" /><div><span>Motion stability</span><strong>{analysis.motionStability}%</strong></div></div>
                <div className="quality-item"><div className="quality-indicator good" /><div><span>Lighting stability</span><strong>{analysis.lighting}%</strong></div></div>
              </div>

              <div className="rppg-method-grid">
                {analysis.methods.map((method) => (
                  <div key={method.method} className="method-chip">
                    <span>{method.method}</span>
                    <strong>{method.heartRate ?? '—'} BPM</strong>
                    <small>V2 evidence</small>
                  </div>
                ))}
              </div>

              <div className="rppg-spectrum">
                <div className="chart-label">Overlapping temporal windows</div>
                <div className="window-hr-list">
                  {analysis.windowHrs.length
                    ? analysis.windowHrs.map((hr, index) => (
                        <span key={`${hr}-${index}`}>W{index + 1}: <strong>{hr.toFixed(1)} BPM</strong></span>
                      ))
                    : <span>No valid V2 windows</span>}
                </div>
                <div className="spectrum-peak">
                  Sampling: <strong>{analysis.samplingRate} FPS</strong>
                  {' · '}
                  Frames: <strong>{analysis.frames}</strong>
                  {' · '}
                  Confidence: <strong>{analysis.confidence}</strong>
                </div>
              </div>

              <p className="technical-note">
                These values expose the V2 measurement pipeline for engineering transparency. They are not diagnostic outputs.
              </p>
            </section>
          )}


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
            disabled={!analysisReady || saving || analyzing}
            onClick={handleContinue}
          >
            {t(
              'rppg',
              'checkTrustScore',
            )}

            <ArrowRight size={18} />
          </button>
        </div>


      </main>
    </div>
  )
}

export default RPPGScreening