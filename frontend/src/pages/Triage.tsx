import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Info,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { t, useLanguage } from '../i18n'
import { runTriage } from '../services/triageService'
import type {
  TriageInput,
} from '../types/triage'
import {
  getPatientRecord,
  savePatientRecord,
} from '../utils/patientRecordStorage'
import type { PatientProfile } from '../types/patientRecord'



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

interface RPPGData {
  trustScore: number
  confidence: 'high' | 'low'
  demoMode?: boolean
  heartRate?: number
  heartRateVariability?: number
  respiratoryRate?: number
  systolicBP?: number
  diastolicBP?: number
}

function Triage() {
  useLanguage()

  const navigate = useNavigate()
  const location = useLocation()

  const patient =
    location.state?.patient as PatientProfile | undefined

  const screening =
    location.state?.screening as
      | ScreeningData
      | undefined

  const rppg =
    location.state?.rppg as
      | RPPGData
      | undefined

  /*
   * ==========================================
   * DATA PREPARATION
   * ==========================================
   *
   * Screening and TrustScore currently pass
   * their data through React Router state.
   *
   * We convert that existing data into the
   * standard TriageInput contract.
   */

  const parseNumber = (
    value: string | undefined,
  ): number | undefined => {
    if (!value || value.trim() === '') {
      return undefined
    }

    const parsed = Number(value)

    return Number.isFinite(parsed)
      ? parsed
      : undefined
  }

  const parseBloodPressure = (
    value: string | undefined,
  ) => {
    if (!value || value.trim() === '') {
      return {
        systolicBP: undefined,
        diastolicBP: undefined,
      }
    }

    const parts = value.split('/')

    return {
      systolicBP: parseNumber(parts[0]),
      diastolicBP: parseNumber(parts[1]),
    }
  }

  const bloodPressure =
    parseBloodPressure(
      screening?.bloodPressure,
    )

  const triageInput: TriageInput = {
    patient: {
      age: Number(patient?.age || 0),
      gender: patient?.gender,
    },

    symptoms:
      screening?.symptoms ?? [],

    duration:
      screening?.duration,

    severity:
      screening?.severity,

    manualVitals:
      screening?.hasManualVitals
        ? {
            pulse: parseNumber(
              screening?.pulse,
            ),

            temperature: parseNumber(
              screening?.temperature,
            ),

            systolicBP:
              bloodPressure.systolicBP,

            diastolicBP:
              bloodPressure.diastolicBP,

            oxygenSaturation:
              parseNumber(
                screening?.oxygenSaturation,
              ),
          }
        : undefined,

    rppg: rppg
      ? {
          trustScore:
            rppg.trustScore,

          confidence:
            rppg.confidence,

          heartRate:
            rppg.heartRate,

          heartRateVariability:
            rppg.heartRateVariability,

          respiratoryRate:
            rppg.respiratoryRate,

          systolicBP:
            rppg.systolicBP,

          diastolicBP:
            rppg.diastolicBP,

          measurementAvailable:
            typeof rppg.trustScore ===
            'number',
        }
      : undefined,
  }

  /*
   * ==========================================
   * RUN TRIAGE ENGINE
   * ==========================================
   */

  const triageResult =
    runTriage(triageInput)

  const category =
    triageResult.category

  /*
   * ==========================================
   * CATEGORY CONTENT
   * ==========================================
   */

  const categoryContent = {
    routine: {
      title: t(
        'triage',
        'routineTitle',
      ),

      description: t(
        'triage',
        'routineDescription',
      ),

      action: t(
        'triage',
        'routineAction',
      ),
    },

    consult: {
      title: t(
        'triage',
        'consultTitle',
      ),

      description: t(
        'triage',
        'consultDescription',
      ),

      action: t(
        'triage',
        'consultAction',
      ),
    },

    urgent: {
      title: t(
        'triage',
        'urgentTitle',
      ),

      description: t(
        'triage',
        'urgentDescription',
      ),

      action: t(
        'triage',
        'urgentAction',
      ),
    },
  }

  const result =
    categoryContent[category]

  /*
   * ==========================================
   * NAVIGATION
   * ==========================================
   */

  const handleBack = () => {
    navigate(
      '/screening/trustscore',
      {
        state: {
          patient,
          screening,
        },
      },
    )
  }

  const handleContinue = () => {
    if (patient?.patientId) {
      const patientRecord = getPatientRecord(
        patient.patientId,
      )

      if (patientRecord) {
        patientRecord.triageHistory.push({
          triageId: crypto.randomUUID(),
          patientId: patient.patientId,
          screeningId: undefined,
          recordedAt: new Date().toISOString(),
          category,
          reasons: triageResult.reasons,
          measurementAction:
            triageResult.measurementAction,
          requiresProfessionalReview:
            triageResult.requiresProfessionalReview,
        })

        savePatientRecord(patientRecord)
      }
    }
    navigate(
      '/referral',
      {
        state: {
          patient,
          screening,
          rppg,

          triage: {
            category,

            reasons:
              triageResult.reasons,

            measurementAction:
              triageResult.measurementAction,

            requiresProfessionalReview:
              triageResult.requiresProfessionalReview,

            demoMode: true,
          },
        },
      },
    )
  }

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div className="page-shell">
      <main className="triage-page">

        {/* =========================
            HEADER
           ========================= */}

        <header className="form-header">
          <button
            className="back-button"
            type="button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />

            {t(
              'common',
              'back',
            )}
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <ClipboardCheck
                size={24}
              />
            </div>

            <div>
              <p className="eyebrow">
                {t(
                  'triage',
                  'eyebrow',
                )}
              </p>

              <h1>
                {t(
                  'triage',
                  'title',
                )}
              </h1>

              <p>
                {t(
                  'triage',
                  'description',
                )}
              </p>
            </div>
          </div>
        </header>

        {/* =========================
            WORKFLOW
           ========================= */}

        <div className="workflow">
          <div className="workflow-step completed">
            <span>✓</span>

            <label>
              {t(
                'screening',
                'registration',
              )}
            </label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step completed">
            <span>✓</span>

            <label>
              {t(
                'screening',
                'symptomsStep',
              )}
            </label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step completed">
            <span>✓</span>

            <label>
              {t(
                'screening',
                'rppg',
              )}
            </label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step active">
            <span>4</span>

            <label>
              {t(
                'screening',
                'triage',
              )}
            </label>
          </div>
        </div>

        {/* =========================
            PATIENT
           ========================= */}

        {patient && (
          <div className="patient-strip">
            <div>
              <span>
                {t(
                  'screening',
                  'screeningFor',
                )}
              </span>

              <strong>
                {patient.name}
              </strong>
            </div>

            <div>
              <span>
                {t(
                  'screening',
                  'age',
                )}
              </span>

              <strong>
                {patient.age || '—'}
              </strong>
            </div>

            <div>
              <span>
                {t(
                  'screening',
                  'village',
                )}
              </span>

              <strong>
                {patient.village || '—'}
              </strong>
            </div>
          </div>
        )}

        {/* =========================
            RESULT
           ========================= */}

        <section
          className={`triage-result-card ${category}`}
        >
          <div className="triage-result-top">

            <div className="triage-result-icon">
              {category === 'urgent' ? (
                <AlertTriangle
                  size={30}
                />
              ) : category ===
                'consult' ? (
                <Stethoscope
                  size={30}
                />
              ) : (
                <CheckCircle2
                  size={30}
                />
              )}
            </div>

            <div>
              <p className="section-kicker">
                {t(
                  'triage',
                  'recommendation',
                )}
              </p>

              <h2>
                {result.title}
              </h2>

              <p>
                {result.description}
              </p>
            </div>
          </div>

          <div className="triage-action">
            <strong>
              {t(
                'triage',
                'nextStep',
              )}
            </strong>

            <span>
              {result.action}
            </span>
          </div>
        </section>

        {/* =========================
            TRIAGE REASONS
           ========================= */}

        <section className="triage-summary-card">
          <div className="summary-card-header">
            <ClipboardCheck
              size={19}
            />

            <h3>
              {t(
                'triage',
                'recommendation',
              )}
            </h3>
          </div>

          <div className="triage-reasons">
            {triageResult.reasons.map(
              (reason, index) => (
                <div
                  key={`${reason}-${index}`}
                  className="triage-reason"
                >
                  <span>
                    {reason}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =========================
            INPUT SUMMARY
           ========================= */}

        <section className="triage-summary-grid">

          {/* Symptoms */}

          <div className="triage-summary-card">
            <div className="summary-card-header">
              <ClipboardCheck
                size={19}
              />

              <h3>
                {t(
                  'triage',
                  'symptomSummary',
                )}
              </h3>
            </div>

            {screening?.symptoms
              ?.length ? (
              <div className="summary-tags">
                {screening.symptoms.map(
                  (symptom) => (
                    <span
                      key={symptom}
                    >
                      {symptom}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="empty-summary">
                {t(
                  'triage',
                  'noSymptoms',
                )}
              </p>
            )}
          </div>

          {/* TrustScore */}

          <div className="triage-summary-card">
            <div className="summary-card-header">
              <ShieldCheck
                size={19}
              />

              <h3>
                {t(
                  'triage',
                  'screeningConfidence',
                )}
              </h3>
            </div>

            <div className="confidence-summary">
              <strong>
                {rppg?.trustScore ??
                  '—'}
              </strong>

              <span>
                /100 TrustScore
              </span>
            </div>

            <p>
              {rppg?.confidence ===
              'high'
                ? t(
                    'triage',
                    'highConfidence',
                  )
                : t(
                    'triage',
                    'lowConfidence',
                  )}
            </p>
          </div>
        </section>

        {/* =========================
            MEASUREMENT ACTION
           ========================= */}

        {triageResult.measurementAction !==
          'none' && (
          <section className="triage-safety">
            <AlertTriangle
              size={19}
            />

            <div>
              <strong>
                {t(
                  'trustScore',
                  'retake',
                )}
              </strong>

              <p>
                {t(
                  'trustScore',
                  'retakeDescription',
                )}
              </p>
            </div>
          </section>
        )}

        {/* =========================
            PROFESSIONAL REVIEW
           ========================= */}

        {triageResult.requiresProfessionalReview && (
          <section className="triage-safety">
            <Stethoscope
              size={19}
            />

            <div>
              <strong>
                {t(
                  'triage',
                  'decisionSupport',
                )}
              </strong>

              <p>
                {t(
                  'triage',
                  'decisionSupportText',
                )}
              </p>
            </div>
          </section>
        )}

        {/* =========================
            SAFETY
           ========================= */}

        {!triageResult.requiresProfessionalReview &&
          triageResult.measurementAction ===
            'none' && (
          <section className="triage-safety">
            <Info size={19} />

            <div>
              <strong>
                {t(
                  'triage',
                  'decisionSupport',
                )}
              </strong>

              <p>
                {t(
                  'triage',
                  'decisionSupportText',
                )}
              </p>
            </div>
          </section>
        )}

        {/* =========================
            FOOTER
           ========================= */}

        <div className="form-footer triage-footer">
          <p>
            {t(
              'triage',
              'footerNote',
            )}
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={handleContinue}
          >
            {result.action}

            <ArrowRight
              size={18}
            />
          </button>
        </div>

        {/* =========================
            PROTOTYPE MARKER
           ========================= */}

        <div className="prototype-note">
          <Info size={16} />

          <span>
            {t(
              'triage',
              'prototypeNote',
            )}
          </span>
        </div>

      </main>
    </div>
  )
}

export default Triage