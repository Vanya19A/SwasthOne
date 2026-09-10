import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  ShieldCheck,
  Activity,
  HeartPulse,
  Wind,
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

type AnalysisState = 'processing' | 'result'

function TrustScore() {
  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient as Patient | undefined
  const screening = location.state?.screening as ScreeningData | undefined

  const [analysisState, setAnalysisState] =
    useState<AnalysisState>('processing')

  /*
   * TEMPORARY PROTOTYPE RESULT
   *
   * This is NOT the real rPPG result.
   * The real Python/ML service will replace these values.
   */
  const [trustScore] = useState(86)

  const isHighConfidence = trustScore >= 70

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnalysisState('result')
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [])

  const handleRetake = () => {
    navigate('/screening/rppg', {
      state: {
        patient,
        screening,
      },
    })
  }

  const handleContinue = () => {
    navigate('/screening/triage', {
      state: {
        patient,
        screening,
        rppg: {
          trustScore,
          confidence:
            isHighConfidence ? 'high' : 'low',
          demoMode: true,
        },
      },
    })
  }

  const scoreColorClass =
    trustScore >= 70
      ? 'trust-high'
      : trustScore >= 40
        ? 'trust-medium'
        : 'trust-low'

  return (
    <div className="page-shell">
      <main className="trust-page">
        {/* Header */}
        <header className="form-header">
          <button
            className="back-button"
            type="button"
            onClick={handleRetake}
          >
            <ArrowLeft size={18} />
            Back to screening
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <ShieldCheck size={24} />
            </div>

            <div>
              <p className="eyebrow">
                Measurement confidence
              </p>

              <h1>
                Checking your screening signal.
              </h1>

              <p>
                SwasthOne checks the quality of the camera signal before
                using the screening result.
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

          <div className="workflow-step completed">
            <span>✓</span>
            <label>rPPG</label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step active">
            <span>4</span>
            <label>TrustScore</label>
          </div>
        </div>

        {/* Patient */}
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

        {analysisState === 'processing' ? (
          <section className="analysis-card">
            <div className="analysis-animation">
              <div className="analysis-ring">
                <Activity size={36} />
              </div>
            </div>

            <h2>Analyzing signal quality...</h2>

            <p>
              Checking lighting, movement and signal consistency.
            </p>

            <div className="analysis-checks">
              <div>
                <span className="check-loading" />
                Signal quality
              </div>

              <div>
                <span className="check-loading" />
                Face stability
              </div>

              <div>
                <span className="check-loading" />
                Measurement consistency
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Main TrustScore */}
            <section className="trust-result-card">
              <div className="trust-result-header">
                <div>
                  <p className="section-kicker">
                    SCREENING CONFIDENCE
                  </p>

                  <h2>
                    Measurement quality
                  </h2>
                </div>

                {isHighConfidence ? (
                  <span className="confidence-badge high">
                    <CheckCircle2 size={15} />
                    High confidence
                  </span>
                ) : (
                  <span className="confidence-badge low">
                    <AlertTriangle size={15} />
                    Low confidence
                  </span>
                )}
              </div>

              <div className="trust-score-layout">
                <div className={`trust-score-circle ${scoreColorClass}`}>
                  <div>
                    <strong>{trustScore}</strong>
                    <span>/100</span>
                  </div>

                  <small>TrustScore</small>
                </div>

                <div className="trust-summary">
                  {isHighConfidence ? (
                    <>
                      <h3>
                        Signal quality looks good.
                      </h3>

                      <p>
                        The captured signal passed the current quality
                        checks and can continue to the screening workflow.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3>
                        We need a clearer measurement.
                      </h3>

                      <p>
                        The signal quality is not strong enough to
                        confidently use this reading.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Quality factors */}
              <div className="quality-grid">
                <QualityItem
                  label="Signal quality"
                  value="Good"
                  good={true}
                />

                <QualityItem
                  label="Movement"
                  value="Stable"
                  good={true}
                />

                <QualityItem
                  label="Lighting"
                  value="Good"
                  good={true}
                />

                <QualityItem
                  label="Face stability"
                  value="Stable"
                  good={true}
                />
              </div>
            </section>

            {/* Screening outputs */}
            {isHighConfidence && (
              <section className="screening-results-card">
                <div className="section-heading">
                  <div>
                    <span className="section-number">
                      01
                    </span>

                    <h2>
                      Screening information
                    </h2>
                  </div>

                  <p>
                    Subject to clinical confirmation
                  </p>
                </div>

                <div className="result-metrics">
                  <div className="result-metric">
                    <div className="metric-icon">
                      <HeartPulse size={21} />
                    </div>

                    <div>
                      <span>
                        Heart rate
                      </span>

                      <strong>
                        Awaiting analysis
                      </strong>

                      <small>
                        bpm
                      </small>
                    </div>
                  </div>

                  <div className="result-metric">
                    <div className="metric-icon">
                      <Activity size={21} />
                    </div>

                    <div>
                      <span>
                        Heart-rate variability
                      </span>

                      <strong>
                        Awaiting analysis
                      </strong>

                      <small>
                        HRV
                      </small>
                    </div>
                  </div>

                  <div className="result-metric">
                    <div className="metric-icon">
                      <Wind size={21} />
                    </div>

                    <div>
                      <span>
                        Respiratory rate
                      </span>

                      <strong>
                        Awaiting analysis
                      </strong>

                      <small>
                        breaths/min
                      </small>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Safety */}
            <section
              className={
                isHighConfidence
                  ? 'trust-safety-card'
                  : 'trust-safety-card warning'
              }
            >
              {isHighConfidence ? (
                <ShieldCheck size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}

              <div>
                <strong>
                  {isHighConfidence
                    ? 'Confidence check passed'
                    : 'Please retake the measurement'}
                </strong>

                <p>
                  {isHighConfidence
                    ? 'The TrustScore indicates that this capture has sufficient signal quality for screening support. Any concerning result should still be confirmed using clinically validated measurements.'
                    : 'Movement, lighting or signal quality may have affected this capture. Retake the measurement or use manual measurements from a healthcare worker.'}
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="trust-disclaimer">
              <Info size={16} />

              <p>
                <strong>Screening support only.</strong>{' '}
                rPPG is not a diagnosis and does not replace clinical
                examination or validated medical equipment.
              </p>
            </div>

            {/* Footer */}
            <div className="form-footer trust-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={handleRetake}
              >
                Retake measurement
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={handleContinue}
                disabled={!isHighConfidence}
              >
                Continue to triage
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Prototype marker */}
            <div className="prototype-note">
              <Info size={16} />

              <span>
                Prototype UI: TrustScore and measurement values will be
                supplied by the rPPG processing service. No clinical result
                is being generated by this frontend screen.
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function QualityItem({
  label,
  value,
  good,
}: {
  label: string
  value: string
  good: boolean
}) {
  return (
    <div className="quality-item">
      <div className={`quality-indicator ${good ? 'good' : 'bad'}`} />

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

export default TrustScore