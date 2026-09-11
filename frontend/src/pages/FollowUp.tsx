import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Info,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { t, useLanguage } from '../i18n'

function FollowUp() {
  useLanguage()

  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient

  const patientData = patient ?? {
    name: 'Patient',
    phone: '—',
    village: '—',
  }

  return (
    <div className="page-shell">
      <main className="followup-page">

        <header className="form-header">
          <button
            className="back-button"
            type="button"
            onClick={() =>
              navigate('/patient-record', {
                state: { patient: patientData },
              })
            }
          >
            <ArrowLeft size={18} />
            {t('common', 'back')}
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <CalendarDays size={24} />
            </div>

            <div>
              <p className="eyebrow">
                {t('followUp', 'eyebrow')}
              </p>

              <h1>
                {t('followUp', 'title')}
              </h1>

              <p>
                {t('followUp', 'description')}
              </p>
            </div>
          </div>
        </header>

        {/* Patient */}

        <section className="followup-patient">
          <div className="followup-patient-avatar">
            {patientData.name
              .split(' ')
              .map((part: string) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <span>
              {t('followUp', 'patient')}
            </span>

            <strong>
              {patientData.name}
            </strong>

            <p>
              {patientData.village || '—'}
            </p>
          </div>
        </section>

        {/* Schedule */}

        <section className="followup-form-card">
          <div className="section-heading">
            <div>
              <span className="section-number">
                01
              </span>

              <h2>
                {t('followUp', 'scheduleTitle')}
              </h2>
            </div>
          </div>

          <div className="followup-option-grid">

            <button
              className="followup-option selected"
              type="button"
            >
              <CalendarDays size={21} />

              <div>
                <strong>
                  {t('screening', 'today') === 'Today'
                    ? 'Tomorrow'
                    : t('followUp', 'tomorrow')}
                </strong>

                <span>
                  {t('followUp', 'recommendedFollowUp')}
                </span>
              </div>

              <CheckCircle2 size={18} />
            </button>

            <button
              className="followup-option"
              type="button"
            >
              <CalendarDays size={21} />

              <div>
                <strong>
                  {t('followUp', 'in3Days')}
                </strong>

                <span>
                  {t('followUp', 'standardFollowUp')}
                </span>
              </div>
            </button>

            <button
              className="followup-option"
              type="button"
            >
              <CalendarDays size={21} />

              <div>
                <strong>
                  {t('followUp', 'in7Days')}
                </strong>

                <span>
                  {t('followUp', 'laterFollowUp')}
                </span>
              </div>
            </button>

          </div>
        </section>

        {/* Reminder */}

        <section className="followup-form-card">
          <div className="section-heading">
            <div>
              <span className="section-number">
                02
              </span>

              <h2>
                {t('followUp', 'reminderTitle')}
              </h2>
            </div>
          </div>

          <div className="reminder-options">

            <div className="reminder-option active">
              <Bell size={19} />

              <div>
                <strong>
                  {t('followUp', 'smsReminder')}
                </strong>

                <span>
                  {patientData.phone}
                </span>
              </div>

              <CheckCircle2 size={17} />
            </div>

            <div className="reminder-option">
              <Phone size={19} />

              <div>
                <strong>
                  {t('followUp', 'callReminder')}
                </strong>

                <span>
                  {t('followUp', 'callDescription')}
                </span>
              </div>
            </div>

            <div className="reminder-option">
              <MessageSquare size={19} />

              <div>
                <strong>
                  {t('followUp', 'ashaReminder')}
                </strong>

                <span>
                  {t('followUp', 'ashaDescription')}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Follow-up purpose */}

        <section className="followup-purpose">
          <Clock3 size={19} />

          <div>
            <strong>
              {t('followUp', 'purposeTitle')}
            </strong>

            <p>
              {t('followUp', 'purposeText')}
            </p>
          </div>
        </section>

        {/* Footer */}

        <div className="form-footer followup-footer">
          <p>
            {t('followUp', 'footerNote')}
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              navigate('/patient-record', {
                state: {
                  patient: patientData,
                  followUp: {
                    scheduled: true,
                    date: 'Tomorrow',
                  },
                },
              })
            }
          >
            <CheckCircle2 size={17} />

            {t('followUp', 'confirm')}
          </button>
        </div>

        <div className="prototype-note">
          <Info size={16} />

          <span>
            {t('followUp', 'prototypeNote')}
          </span>
        </div>

      </main>
    </div>
  )
}

export default FollowUp