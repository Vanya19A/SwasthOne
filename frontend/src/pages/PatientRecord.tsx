import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileHeart,
  HeartPulse,
  Info,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { t, useLanguage } from '../i18n'
import { getPatientRecord } from '../utils/patientRecordStorage'

function PatientRecord() {
  useLanguage()

  const navigate = useNavigate()
  const location = useLocation()
  const patientFromState = location.state?.patient

  const storedRecord = patientFromState?.patientId
    ? getPatientRecord(patientFromState.patientId)
    : undefined

  const patient = storedRecord?.patient ?? patientFromState

  // const patient = location.state?.patient

  const patientData = patient ?? {
    name: 'Patient',
    age: 0,
    gender: '—',
    phone: '—',
    village: '—',
  }
  const latestScreening =
    storedRecord && storedRecord.screenings.length > 0
      ? storedRecord.screenings[
          storedRecord.screenings.length - 1
        ]
      : undefined

  return (
    <div className="page-shell">
      <main className="record-page">

        {/* Header */}

        <header className="form-header">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={18} />

            {t('common', 'back')}
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <FileHeart size={24} />
            </div>

            <div>
              <p className="eyebrow">
                {t('record', 'eyebrow')}
              </p>

              <h1>
                {t('record', 'title')}
              </h1>

              <p>
                {t('record', 'description')}
              </p>
            </div>
          </div>
        </header>

        {/* Patient profile */}

        <section className="record-profile-card">
          <div className="record-avatar">
            {patientData.name
              .split(' ')
              .map((part: string) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="record-profile-main">
            <div className="record-name-row">
              <h2>
                {patientData.name}
              </h2>

              <span className="record-status">
                <CheckCircle2 size={14} />

                {t('record', 'activeRecord')}
              </span>
            </div>

            <div className="record-meta">
              <span>
                <UserRound size={14} />

                {patientData.age > 0
                ? `${patientData.age} ${t('profile', 'years')}`
                : '—'}
              </span>

              <span>
                {patientData.gender}
              </span>

              <span>
                <MapPin size={14} />

                {patientData.village || '—'}
              </span>
            </div>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              navigate('/patients/profile', {
                state: {
                  patient: patientData,
                },
              })
            }
          >
            {t('record', 'viewProfile')}
          </button>
        </section>

        {/* Current status */}

        <section className="record-overview">
          <div className="overview-item">
            <div className="overview-icon teal">
              <Activity size={19} />
            </div>

            <div>
              <span>
                {t(
                  'record',
                  'latestScreening',
                )}
              </span>

              <strong>
                {latestScreening
                  ? new Date(
                      latestScreening.recordedAt,
                    ).toLocaleDateString()
                  : '—'}
              </strong>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-icon green">
              <ShieldCheck size={19} />
            </div>

            <div>
              <span>
                {t(
                  'record',
                  'trustScore',
                )}
              </span>

              <strong>
                86/100
              </strong>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-icon orange">
              <Stethoscope size={19} />
            </div>

            <div>
              <span>
                {t(
                  'record',
                  'careStatus',
                )}
              </span>

              <strong>
                {t('record', 'referralSent')}
              </strong>
            </div>
          </div>
        </section>

        {/* Timeline */}

        <section className="record-section">
          <div className="record-section-header">
            <div>
              <p className="section-kicker">
                {t(
                  'record',
                  'careJourney',
                )}
              </p>

              <h2>
                {t(
                  'record',
                  'journeyTitle',
                )}
              </h2>
            </div>

            <span className="record-date">
              <CalendarDays size={14} />

              {t('record', 'today')}
            </span>
          </div>

          <div className="care-timeline">

            <TimelineItem
              icon={<UserRound size={17} />}
              title={t(
                'record',
                'registered',
              )}
              description={t(
                'record',
                'registeredDescription',
              )}
              status="completed"
            />

            <TimelineItem
              icon={<ClipboardCheck size={17} />}
              title={t(
                'record',
                'screening',
              )}
              description={t(
                'record',
                'screeningDescription',
              )}
              status="completed"
            />

            <TimelineItem
              icon={<ShieldCheck size={17} />}
              title={t(
                'record',
                'trustScoreEvent',
              )}
              description={t(
                'record',
                'trustScoreDescription',
              )}
              status="completed"
            />

            <TimelineItem
              icon={<Activity size={17} />}
              title={t(
                'record',
                'triage',
              )}
              description={t(
                'record',
                'triageDescription',
              )}
              status="completed"
            />

            <TimelineItem
              icon={<Stethoscope size={17} />}
              title={t(
                'record',
                'referralEvent',
              )}
              description={t(
                'record',
                'referralDescription',
              )}
              status="current"
            />

            <TimelineItem
              icon={<HeartPulse size={17} />}
              title={t(
                'record',
                'followUpEvent',
              )}
              description={t(
                'record',
                'followUpDescription',
              )}
              status="upcoming"
            />

          </div>
        </section>

        {/* Screening history */}

        <section className="record-section">
          <div className="record-section-header">
            <div>
              <p className="section-kicker">
                {t(
                  'record',
                  'history',
                )}
              </p>

              <h2>
                {t(
                  'record',
                  'historyTitle',
                )}
              </h2>
            </div>

            <button
              className="text-button"
              type="button"
            >
              {t(
                'record',
                'viewAll',
              )}
            </button>
          </div>

          <div className="history-table">

            <div className="history-row history-header">
              <span>
                {t('record', 'date')}
              </span>

              <span>
                {t('record', 'screening')}
              </span>

              <span>
                {t('record', 'trustScore')}
              </span>

              <span>
                {t('record', 'status')}
              </span>
            </div>

            {latestScreening ? (
              <div className="history-row">
                <span>
                  {new Date(
                    latestScreening.recordedAt,
                  ).toLocaleDateString()}
                </span>

                <span>
                  {latestScreening.symptoms.length > 0
                    ? latestScreening.symptoms.join(', ')
                    : 'General screening'}
                </span>

                <strong>
                  —
                </strong>

                <span className="history-status">
                  {t(
                    'record',
                    'completed',
                  )}
                </span>
              </div>
            ) : (
              <div className="history-row">
                <span>—</span>

                <span>
                  {t(
                    'record',
                    'previousScreening',
                  )}
                </span>

                <span>—</span>

                <span className="history-status muted">
                  {t(
                    'record',
                    'noPreviousRecord',
                  )}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Follow-up */}

        <section className="followup-action-card">
          <div className="followup-action-icon">
            <CalendarDays size={23} />
          </div>

          <div>
            <p className="section-kicker">
              {t(
                'record',
                'nextCare',
              )}
            </p>

            <h2>
              {t(
                'record',
                'followUpTitle',
              )}
            </h2>

            <p>
              {t(
                'record',
                'followUpText',
              )}
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              navigate('/follow-up', {
                state: {
                  patient: patientData,
                },
              })
            }
          >
            {t(
              'record',
              'scheduleFollowUp',
            )}

            <ArrowRight size={17} />
          </button>
        </section>

        {/* Safety */}

        <div className="record-disclaimer">
          <Info size={16} />

          <p>
            {t(
              'record',
              'disclaimer',
            )}
          </p>
        </div>

        <div className="prototype-note">
          <Info size={16} />

          <span>
            {t(
              'record',
              'prototypeNote',
            )}
          </span>
        </div>

      </main>
    </div>
  )
}

function TimelineItem({
  icon,
  title,
  description,
  status,
}: {
  icon: ReactNode
  title: string
  description: string
  status:
    | 'completed'
    | 'current'
    | 'upcoming'
}) {
  return (
    <div
      className={`care-timeline-item ${status}`}
    >
      <div className="care-timeline-marker">
        {icon}
      </div>

      <div className="care-timeline-content">
        <div>
          <strong>{title}</strong>

          {status === 'completed' && (
            <span className="timeline-completed">
              <CheckCircle2 size={13} />

              Complete
            </span>
          )}

          {status === 'current' && (
            <span className="timeline-current">
              Current
            </span>
          )}
        </div>

        <p>{description}</p>
      </div>
    </div>
  )
}

export default PatientRecord