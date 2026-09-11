import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Hospital,
  Info,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { t, useLanguage } from '../i18n'

function ReferralTracking() {
  useLanguage()

  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient

  const facility = location.state?.facility ?? {
    name: 'Primary Health Centre',
    type: 'PHC',
    distance: '3.2 km',
  }

  const steps = [
    {
      title: t('referral', 'created'),
      description: t('referral', 'createdDescription'),
      completed: true,
    },
    {
      title: t('referral', 'sent'),
      description: t('referral', 'sentDescription'),
      completed: true,
    },
    {
      title: t('referral', 'accepted'),
      description: t('referral', 'acceptedDescription'),
      completed: false,
    },
    {
      title: t('referral', 'appointment'),
      description: t('referral', 'appointmentDescription'),
      completed: false,
    },
    {
      title: t('referral', 'consulted'),
      description: t('referral', 'consultedDescription'),
      completed: false,
    },
    {
      title: t('referral', 'followUp'),
      description: t('referral', 'followUpDescription'),
      completed: false,
    },
  ]

  return (
    <div className="page-shell">
      <main className="tracking-page">

        <header className="form-header">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate('/referral')}
          >
            <ArrowLeft size={18} />
            {t('common', 'back')}
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <Send size={24} />
            </div>

            <div>
              <p className="eyebrow">
                {t('referral', 'trackingEyebrow')}
              </p>

              <h1>
                {t('referral', 'trackingTitle')}
              </h1>

              <p>
                {t('referral', 'trackingDescription')}
              </p>
            </div>
          </div>
        </header>

        {patient && (
          <div className="patient-strip">
            <div>
              <span>{t('screening', 'screeningFor')}</span>
              <strong>{patient.name}</strong>
            </div>

            <div>
              <span>{t('screening', 'age')}</span>
              <strong>{patient.age || '—'}</strong>
            </div>

            <div>
              <span>{t('screening', 'village')}</span>
              <strong>{patient.village || '—'}</strong>
            </div>
          </div>
        )}

        {/* Referral status */}

        <section className="tracking-status-card">
          <div className="tracking-status-icon">
            <Send size={24} />
          </div>

          <div>
            <span className="section-kicker">
              {t('referral', 'currentStatus')}
            </span>

            <h2>{t('referral', 'sent')}</h2>

            <p>
              {t('referral', 'statusDescription')}
            </p>
          </div>

          <span className="tracking-status-badge">
            <Clock3 size={14} />
            Pending acceptance
          </span>
        </section>

        {/* Facility */}

        <section className="tracking-facility-card">
          <div className="tracking-facility-icon">
            <Hospital size={23} />
          </div>

          <div className="tracking-facility-info">
            <span>{facility.type}</span>

            <h2>{facility.name}</h2>

            <p>
              <MapPin size={14} />
              {facility.distance}
            </p>
          </div>

          <button
            className="secondary-button"
            type="button"
          >
            <Phone size={16} />
            Contact facility
          </button>
        </section>

        {/* Timeline */}

        <section className="timeline-card">
          <div className="section-heading">
            <div>
              <span className="section-number">01</span>
              <h2>{t('referral', 'lifecycle')}</h2>
            </div>
          </div>

          <div className="referral-timeline">
            {steps.map((step, index) => (
              <div
                className={`timeline-step ${
                  step.completed ? 'completed' : ''
                }`}
                key={step.title}
              >
                <div className="timeline-marker">
                  {step.completed ? (
                    <Check size={15} />
                  ) : (
                    index + 1
                  )}
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`timeline-connector ${
                      step.completed ? 'completed' : ''
                    }`}
                  />
                )}

                <div className="timeline-content">
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Follow-up */}

        <section className="followup-card">
          <div className="followup-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h3>{t('referral', 'continuityTitle')}</h3>

            <p>
              {t('referral', 'continuityText')}
            </p>
          </div>
        </section>

        <section className="referral-safety">
          <Info size={19} />

          <div>
            <strong>
              {t('referral', 'trackingSafetyTitle')}
            </strong>

            <p>
              {t('referral', 'trackingSafetyText')}
            </p>
          </div>
        </section>
        <div className="form-footer tracking-footer">
          <p>
            Continue the patient's care journey in the longitudinal record.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              navigate('/patient-record', {
                state: {
                  patient,
                },
              })
            }
          >
            View patient record
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="prototype-note">
          <Info size={16} />

          <span>
            {t('referral', 'trackingPrototypeNote')}
          </span>
        </div>

      </main>
    </div>
  )
}

export default ReferralTracking