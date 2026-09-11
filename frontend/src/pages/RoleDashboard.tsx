import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  ClipboardList,
  Cloud,
  CloudOff,
  FileHeart,
  HeartPulse,
  Plus,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'
import LanguageSelector from '../components/LanguageSelector'
import { t, useLanguage } from '../i18n'
import { getPendingRecords } from '../utils/offlineStorage'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

type Role = 'asha' | 'patient' | 'doctor'

interface RoleDashboardProps {
  role: Role
}

function RoleDashboard({ role }: RoleDashboardProps) {
  const navigate = useNavigate()
  const language = useLanguage()

  const isASHA = role === 'asha'
  const isPatient = role === 'patient'
  const isDoctor = role === 'doctor'

  const today = new Intl.DateTimeFormat(
    language === 'hi'
      ? 'hi-IN'
      : language === 'mr'
        ? 'mr-IN'
        : 'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(new Date())

  const greeting = isPatient
    ? t('roleDashboard', 'welcomeBack')
    : t('roleDashboard', 'goodEvening')

  return (
    <div className="app-shell">
      <Sidebar
        activeItem={
          isPatient ? 'Health Records' : 'Dashboard'
        }
      />

      <main className="main-content">
        {/* HEADER */}
        <header className="topbar">
          <div>
            <p className="eyebrow">{today}</p>

            <h1>
              {greeting} 👋
            </h1>
          </div>

          <div className="topbar-actions">
            <LanguageSelector />

            <button
              className="notification-button"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={21} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        {/* ROLE WELCOME CARD */}
        <section className="welcome-card">
          <div className="welcome-content">
            <div className="welcome-icon">
              {isASHA && <Users size={25} />}
              {isPatient && <HeartPulse size={25} />}
              {isDoctor && <Stethoscope size={25} />}
            </div>

            <div>
              <p className="welcome-label">
                {isASHA &&
                  t('roleDashboard', 'fieldWorkflow')}

                {isPatient &&
                  t(
                    'roleDashboard',
                    'healthcareJourney',
                  )}

                {isDoctor &&
                  t(
                    'roleDashboard',
                    'clinicalWorkspace',
                  )}
              </p>

              <h2>
                {isASHA &&
                  t(
                    'roleDashboard',
                    'ashaHeadline',
                  )}

                {isPatient &&
                  t(
                    'roleDashboard',
                    'patientHeadline',
                  )}

                {isDoctor &&
                  t(
                    'roleDashboard',
                    'doctorHeadline',
                  )}
              </h2>

              <p>
                {isASHA &&
                  t(
                    'roleDashboard',
                    'ashaDescription',
                  )}

                {isPatient &&
                  t(
                    'roleDashboard',
                    'patientDescription',
                  )}

                {isDoctor &&
                  t(
                    'roleDashboard',
                    'doctorDescription',
                  )}
              </p>
            </div>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              if (isDoctor) {
                navigate('/doctor')
              } else {
                navigate('/patients/register')
              }
            }}
          >
            <Plus size={18} />

            {isDoctor
              ? t(
                  'roleDashboard',
                  'reviewPatients',
                )
              : t(
                  'roleDashboard',
                  'startScreening',
                )}
          </button>
        </section>

        {/* =================================================
            ASHA DASHBOARD
           ================================================= */}

        {isASHA && (
          <>
            <section className="stats-grid">
              <StatCard
                icon={<Users size={21} />}
                label={t(
                  'roleDashboard',
                  'patientsToday',
                )}
                value="24"
                note={t(
                  'roleDashboard',
                  'fromYesterday',
                )}
                iconClass="teal"
              />

              <StatCard
                icon={<Activity size={21} />}
                label={t(
                  'roleDashboard',
                  'screenings',
                )}
                value="18"
                note={t(
                  'roleDashboard',
                  'completed',
                )}
                iconClass="green"
              />

              <StatCard
                icon={<CalendarDays size={21} />}
                label={t(
                  'roleDashboard',
                  'followUps',
                )}
                value="7"
                note={t(
                  'roleDashboard',
                  'dueToday',
                )}
                iconClass="orange"
              />
            </section>

            <div className="content-grid">
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-kicker">
                      {t(
                        'roleDashboard',
                        'patientWorkflow',
                      )}
                    </p>

                    <h3>
                      {t(
                        'roleDashboard',
                        'quickActions',
                      )}
                    </h3>
                  </div>
                </div>

                <div className="quick-actions">
                  <ActionCard
                    icon={<Users size={21} />}
                    title={t(
                      'roleDashboard',
                      'registerPatient',
                    )}
                    description={t(
                      'roleDashboard',
                      'registerDescription',
                    )}
                    onClick={() =>
                      navigate('/patients/register')
                    }
                  />

                  <ActionCard
                    icon={<Activity size={21} />}
                    title={t(
                      'roleDashboard',
                      'continueScreening',
                    )}
                    description={t(
                      'roleDashboard',
                      'continueDescription',
                    )}
                    onClick={() =>
                      navigate('/patients/register')
                    }
                  />

                  <ActionCard
                    icon={<ClipboardList size={21} />}
                    title={t(
                      'roleDashboard',
                      'viewReferrals',
                    )}
                    description={t(
                      'roleDashboard',
                      'referralDescription',
                    )}
                    onClick={() =>
                      navigate('/referral/tracking')
                    }
                  />
                </div>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-kicker">
                      {t(
                        'roleDashboard',
                        'recentActivity',
                      )}
                    </p>

                    <h3>
                      {t(
                        'roleDashboard',
                        'patientsAttention',
                      )}
                    </h3>
                  </div>
                </div>

                <PatientList
                  patients={[
                    {
                      initials: 'RK',
                      name: 'Ramesh Kumar',
                      status: t(
                        'roleDashboard',
                        'routine',
                      ),
                      statusClass: 'routine',
                    },
                    {
                      initials: 'SP',
                      name: 'Sunita Patel',
                      status: t(
                        'roleDashboard',
                        'consult',
                      ),
                      statusClass: 'consult',
                    },
                    {
                      initials: 'AM',
                      name: 'Anil Mehta',
                      status: t(
                        'roleDashboard',
                        'urgent',
                      ),
                      statusClass: 'urgent',
                    },
                  ]}
                />
              </section>
            </div>

            <OfflineStatus />
          </>
        )}

        {/* =================================================
            PATIENT DASHBOARD
           ================================================= */}

        {isPatient && (
          <>
            <section className="stats-grid">
              <StatCard
                icon={<HeartPulse size={21} />}
                label={t(
                  'roleDashboard',
                  'latestTrustScore',
                )}
                value="86"
                note={t(
                  'roleDashboard',
                  'screeningConfidence',
                )}
                iconClass="teal"
              />

              <StatCard
                icon={<FileHeart size={21} />}
                label={t(
                  'roleDashboard',
                  'healthRecords',
                )}
                value="3"
                note={t(
                  'roleDashboard',
                  'availableRecords',
                )}
                iconClass="green"
              />

              <StatCard
                icon={<CalendarDays size={21} />}
                label={t(
                  'roleDashboard',
                  'nextFollowUp',
                )}
                value={
                  language === 'en'
                    ? 'Tomorrow'
                    : language === 'hi'
                      ? 'कल'
                      : 'उद्या'
                }
                note={t(
                  'roleDashboard',
                  'recommended',
                )}
                iconClass="orange"
              />
            </section>

            <div className="content-grid">
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-kicker">
                      {t(
                        'roleDashboard',
                        'myHealthcare',
                      )}
                    </p>

                    <h3>
                      {t(
                        'roleDashboard',
                        'whatToDo',
                      )}
                    </h3>
                  </div>
                </div>

                <div className="quick-actions">
                  <ActionCard
                    icon={<Activity size={21} />}
                    title={t(
                      'roleDashboard',
                      'startScreening',
                    )}
                    description={t(
                      'roleDashboard',
                      'startScreeningDescription',
                    )}
                    onClick={() =>
                      navigate('/patients/register')
                    }
                  />

                  <ActionCard
                    icon={<FileHeart size={21} />}
                    title={t(
                      'roleDashboard',
                      'healthRecords',
                    )}
                    description={t(
                      'roleDashboard',
                      'healthRecordsDescription',
                    )}
                    onClick={() =>
                      navigate('/patient-record')
                    }
                  />

                  <ActionCard
                    icon={<ClipboardList size={21} />}
                    title={t(
                      'roleDashboard',
                      'myReferrals',
                    )}
                    description={t(
                      'roleDashboard',
                      'myReferralsDescription',
                    )}
                    onClick={() =>
                      navigate('/referral/tracking')
                    }
                  />
                </div>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="section-kicker">
                      {t(
                        'roleDashboard',
                        'nextStep',
                      )}
                    </p>

                    <h3>
                      {t(
                        'roleDashboard',
                        'followUpCare',
                      )}
                    </h3>
                  </div>
                </div>

                <div className="role-info-card">
                  <div className="role-info-icon">
                    <CalendarDays size={22} />
                  </div>

                  <div>
                    <strong>
                      {t(
                        'roleDashboard',
                        'followUpTomorrow',
                      )}
                    </strong>

                    <span>
                      {t(
                        'roleDashboard',
                        'followUpDescription',
                      )}
                    </span>
                  </div>

                  <ArrowRight size={18} />
                </div>
              </section>
            </div>

            <section className="trust-banner">
              <div className="trust-banner-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <strong>
                  {t(
                    'roleDashboard',
                    'healthConnectedTitle',
                  )}
                </strong>

                <p>
                  {t(
                    'roleDashboard',
                    'healthConnectedDescription',
                  )}
                </p>
              </div>
            </section>
          </>
        )}

        {/* =================================================
            DOCTOR DASHBOARD
           ================================================= */}

        {isDoctor && (
          <>
            <section className="stats-grid">
              <StatCard
                icon={<Users size={21} />}
                label={t(
                  'roleDashboard',
                  'patientsAwaitingReview',
                )}
                value="8"
                note={t(
                  'roleDashboard',
                  'needsClinicalReview',
                )}
                iconClass="teal"
              />

              <StatCard
                icon={<Activity size={21} />}
                label={t(
                  'roleDashboard',
                  'urgentCases',
                )}
                value="2"
                note={t(
                  'roleDashboard',
                  'requiresAttention',
                )}
                iconClass="orange"
              />

              <StatCard
                icon={<CalendarDays size={21} />}
                label={t(
                  'roleDashboard',
                  'todaysConsultations',
                )}
                value="6"
                note={t(
                  'roleDashboard',
                  'scheduledToday',
                )}
                iconClass="green"
              />
            </section>

            <section className="panel doctor-review-panel">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">
                    {t(
                      'roleDashboard',
                      'clinicalReview',
                    )}
                  </p>

                  <h3>
                    {t(
                      'roleDashboard',
                      'patientsAwaitingReview',
                    )}
                  </h3>
                </div>

                <span className="doctor-review-count">
                  8{' '}
                  {t(
                    'roleDashboard',
                    'pending',
                  )}
                </span>
              </div>

              <div className="doctor-patient-list">
                <DoctorPatient
                  initials="AM"
                  name="Anil Mehta"
                  age="52 years"
                  reason="Chest discomfort"
                  status={t(
                    'roleDashboard',
                    'urgent',
                  )}
                  statusClass="urgent"
                  onClick={() =>
                    navigate('/patient-record')
                  }
                />

                <DoctorPatient
                  initials="SP"
                  name="Sunita Patel"
                  age="41 years"
                  reason="Fever + elevated pulse"
                  status={t(
                    'roleDashboard',
                    'consult',
                  )}
                  statusClass="consult"
                  onClick={() =>
                    navigate('/patient-record')
                  }
                />

                <DoctorPatient
                  initials="RK"
                  name="Ramesh Kumar"
                  age="35 years"
                  reason="Routine screening"
                  status={t(
                    'roleDashboard',
                    'routine',
                  )}
                  statusClass="routine"
                  onClick={() =>
                    navigate('/patient-record')
                  }
                />
              </div>
            </section>

            <section className="trust-banner">
              <div className="trust-banner-icon">
                <Stethoscope size={22} />
              </div>

              <div>
                <strong>
                  {t(
                    'roleDashboard',
                    'reviewSafetyTitle',
                  )}
                </strong>

                <p>
                  {t(
                    'roleDashboard',
                    'reviewSafetyDescription',
                  )}
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon,
  label,
  value,
  note,
  iconClass,
}: {
  icon: ReactNode
  label: string
  value: string
  note: string
  iconClass: string
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>
        {icon}
      </div>

      <div>
        <span className="stat-label">
          {label}
        </span>

        <strong>{value}</strong>

        <small>{note}</small>
      </div>
    </div>
  )
}

/* =========================================================
   ACTION CARD
   ========================================================= */

function ActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      className="action-card"
      type="button"
      onClick={onClick}
    >
      <div className="action-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <ArrowRight size={18} />
    </button>
  )
}

/* =========================================================
   PATIENT LIST
   ========================================================= */

function PatientList({
  patients,
}: {
  patients: {
    initials: string
    name: string
    status: string
    statusClass: string
  }[]
}) {
  return (
    <div className="patient-list">
      {patients.map((patient) => (
        <div
          className="patient-row"
          key={patient.name}
        >
          <div className="patient-avatar">
            {patient.initials}
          </div>

          <div className="patient-info">
            <strong>{patient.name}</strong>

            <span>
              {t(
                'roleDashboard',
                'recentlyScreened',
              )}
            </span>
          </div>

          <span
            className={`status-pill ${patient.statusClass}`}
          >
            {patient.status}
          </span>
        </div>
      ))}
    </div>
  )
}

/* =========================================================
   DOCTOR PATIENT
   ========================================================= */

function DoctorPatient({
  initials,
  name,
  age,
  reason,
  status,
  statusClass,
  onClick,
}: {
  initials: string
  name: string
  age: string
  reason: string
  status: string
  statusClass: string
  onClick: () => void
}) {
  return (
    <button
      className="doctor-patient-row"
      type="button"
      onClick={onClick}
    >
      <div className="patient-avatar">
        {initials}
      </div>

      <div className="doctor-patient-info">
        <strong>{name}</strong>

        <span>
          {age} · {reason}
        </span>
      </div>

      <span
        className={`status-pill ${statusClass}`}
      >
        {status}
      </span>

      <ArrowRight size={18} />
    </button>
  )
}

/* =========================================================
   OFFLINE STATUS
   ========================================================= */

function OfflineStatus() {
  const isOnline = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(getPendingRecords().length)
    }

    updatePendingCount()

    window.addEventListener(
      'storage',
      updatePendingCount,
    )

    return () => {
      window.removeEventListener(
        'storage',
        updatePendingCount,
      )
    }
  }, [isOnline])

  return (
    <section className="offline-status-card">
      {isOnline ? (
        <Cloud size={21} />
      ) : (
        <CloudOff size={21} />
      )}

      <div>
        <strong>
          {isOnline
            ? t('roleDashboard', 'online')
            : t(
                'roleDashboard',
                'offlineMode',
              )}
        </strong>

        <span>
          {isOnline
            ? pendingCount > 0
              ? `${pendingCount} ${t(
                  'roleDashboard',
                  'pendingSync',
                )}`
              : t(
                  'roleDashboard',
                  'allSynced',
                )
            : t(
                'roleDashboard',
                'offlineDescription',
              )}
        </span>
      </div>

      {isOnline && pendingCount > 0 && (
        <span className="offline-pending">
          {pendingCount}{' '}
          {t(
            'roleDashboard',
            'pending',
          )}
        </span>
      )}
    </section>
  )
}

export default RoleDashboard