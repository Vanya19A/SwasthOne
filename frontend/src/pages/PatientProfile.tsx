import { ArrowRight, CalendarDays, MapPin, Phone, UserRound } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

interface Patient {
  name: string
  age: string
  gender: string
  phone: string
  village: string
  emergencyContact: string
}

function PatientProfile() {
  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient as Patient | undefined

  if (!patient) {
    return (
      <div className="app-shell">
        <main className="form-page">
          <h1>Patient not found</h1>
          <p>Please register a patient first.</p>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate('/patients/register')}
          >
            Register patient
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="form-page">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate('/patients/register')}
        >
          ← Back to registration
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {patient.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p className="section-kicker">Patient profile</p>
            <h1>{patient.name}</h1>
            <p>
              Patient registration completed successfully.
            </p>
          </div>

          <span className="registered-badge">
            Registered
          </span>
        </div>

        <section className="profile-grid">
          <div className="profile-info-card">
            <div className="profile-info-icon">
              <UserRound size={19} />
            </div>

            <div>
              <span>Age & gender</span>
              <strong>
                {patient.age} years · {patient.gender}
              </strong>
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-icon">
              <Phone size={19} />
            </div>

            <div>
              <span>Mobile</span>
              <strong>
                {patient.phone || 'Not provided'}
              </strong>
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-icon">
              <MapPin size={19} />
            </div>

            <div>
              <span>Location</span>
              <strong>{patient.village}</strong>
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-icon">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>Registration</span>
              <strong>Today</strong>
            </div>
          </div>
        </section>

        <section className="next-step-card">
          <div>
            <p className="section-kicker">Next step</p>
            <h2>Start health screening</h2>
            <p>
              Record symptoms and basic vitals before the
              screening assessment.
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate('/screening', {
              state: { patient },
            })}
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </section>

        <div className="profile-safety-note">
          Patient information should only be accessed by authorized
          healthcare personnel.
        </div>
      </main>
    </div>
  )
}

export default PatientProfile