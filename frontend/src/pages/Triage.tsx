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

interface RPPGData {
  trustScore: number
  confidence: 'high' | 'low'
  demoMode?: boolean
}

type TriageCategory = 'routine' | 'consult' | 'urgent'

function Triage() {
  useLanguage()

  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient as Patient | undefined
  const screening = location.state?.screening as ScreeningData | undefined
  const rppg = location.state?.rppg as RPPGData | undefined

  /*
   * TEMPORARY FRONTEND DEMO RULES
   *
   * The real triage engine will eventually provide this result.
   * These rules are only here so the complete prototype flow works.
   */

  const getTriageCategory = (): TriageCategory => {
    const symptoms = screening?.symptoms ?? []

    const hasChestDiscomfort =
      symptoms.includes('Chest discomfort')

    const hasBreathingDifficulty =
      symptoms.includes('Breathing difficulty')

    const hasFever =
      symptoms.includes('Fever')

    const pulse = Number(screening?.pulse || 0)

    if (
      hasChestDiscomfort ||
      hasBreathingDifficulty
    ) {
      return 'urgent'
    }

    if (
      hasFever &&
      pulse > 100
    ) {
      return 'consult'
    }

    return 'routine'
  }

  const category = getTriageCategory()

  const categoryContent = {
    routine: {
      title: t('triage', 'routineTitle'),
      description: t('triage', 'routineDescription'),
      action: t('triage', 'routineAction'),
    },

    consult: {
      title: t('triage', 'consultTitle'),
      description: t('triage', 'consultDescription'),
      action: t('triage', 'consultAction'),
    },

    urgent: {
      title: t('triage', 'urgentTitle'),
      description: t('triage', 'urgentDescription'),
      action: t('triage', 'urgentAction'),
    },
  }

  const result = categoryContent[category]

  const handleBack = () => {
    navigate('/screening/trustscore', {
      state: {
        patient,
        screening,
      },
    })
  }

  const handleContinue = () => {
    /*
     * Next workflow step will be consultation/referral.
     * For now we keep the data available for the next screen.
     */
    navigate('/referral', {
      state: {
        patient,
        screening,
        rppg,
        triage: {
          category,
          demoMode: true,
        },
      },
    })
  }

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
            {t('common', 'back')}
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <ClipboardCheck size={24} />
            </div>

            <div>
              <p className="eyebrow">
                {t('triage', 'eyebrow')}
              </p>

              <h1>
                {t('triage', 'title')}
              </h1>

              <p>
                {t('triage', 'description')}
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

          <div className="workflow-step completed">
            <span>✓</span>
            <label>
              {t('screening', 'rppg')}
            </label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step active">
            <span>4</span>
            <label>
              {t('screening', 'triage')}
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

        {/* =========================
            RESULT
           ========================= */}

        <section
          className={`triage-result-card ${category}`}
        >
          <div className="triage-result-top">
            <div className="triage-result-icon">
              {category === 'urgent' ? (
                <AlertTriangle size={30} />
              ) : category === 'consult' ? (
                <Stethoscope size={30} />
              ) : (
                <CheckCircle2 size={30} />
              )}
            </div>

            <div>
              <p className="section-kicker">
                {t('triage', 'recommendation')}
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
              {t('triage', 'nextStep')}
            </strong>

            <span>
              {result.action}
            </span>
          </div>
        </section>

        {/* =========================
            INPUT SUMMARY
           ========================= */}

        <section className="triage-summary-grid">

          <div className="triage-summary-card">
            <div className="summary-card-header">
              <ClipboardCheck size={19} />

              <h3>
                {t('triage', 'symptomSummary')}
              </h3>
            </div>

            {screening?.symptoms?.length ? (
              <div className="summary-tags">
                {screening.symptoms.map(
                  (symptom) => (
                    <span key={symptom}>
                      {symptom}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="empty-summary">
                {t('triage', 'noSymptoms')}
              </p>
            )}
          </div>

          <div className="triage-summary-card">
            <div className="summary-card-header">
              <ShieldCheck size={19} />

              <h3>
                {t('triage', 'screeningConfidence')}
              </h3>
            </div>

            <div className="confidence-summary">
              <strong>
                {rppg?.trustScore ?? '—'}
              </strong>

              <span>
                /100 TrustScore
              </span>
            </div>

            <p>
              {rppg?.confidence === 'high'
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
            SAFETY
           ========================= */}

        <section className="triage-safety">
          <Info size={19} />

          <div>
            <strong>
              {t('triage', 'decisionSupport')}
            </strong>

            <p>
              {t('triage', 'decisionSupportText')}
            </p>
          </div>
        </section>

        {/* =========================
            FOOTER
           ========================= */}

        <div className="form-footer triage-footer">
          <p>
            {t('triage', 'footerNote')}
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={handleContinue}
          >
            {result.action}
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Prototype marker */}

        <div className="prototype-note">
          <Info size={16} />

          <span>
            {t('triage', 'prototypeNote')}
          </span>
        </div>

      </main>
    </div>
  )
}

export default Triage