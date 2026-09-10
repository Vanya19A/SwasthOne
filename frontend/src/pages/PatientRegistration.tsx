import { FormEvent, useState } from 'react'
import { ArrowLeft, CheckCircle2, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PatientData {
  name: string
  age: string
  gender: string
  phone: string
  village: string
  emergencyContact: string
}

function PatientRegistration() {
  const navigate = useNavigate()

  const [form, setForm] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    phone: '',
    village: '',
    emergencyContact: '',
  })

  const [consent, setConsent] = useState(false)

  const updateField = (
    field: keyof PatientData,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!consent) {
      return
    }

    navigate('/patients/profile', {
      state: {
        patient: form,
      },
    })
  }

  return (
    <div className="app-shell">
      <main className="form-page">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <div className="form-header">
          <div className="form-title-icon">
            <UserRound size={25} />
          </div>

          <div>
            <p className="section-kicker">Patient workflow</p>
            <h1>Register a patient</h1>
            <p>
              Create a basic patient profile before starting screening.
            </p>
          </div>
        </div>

        <div className="workflow-steps">
          <div className="workflow-step active">
            <span>1</span>
            Registration
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>2</span>
            Symptoms
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>3</span>
            Screening
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>4</span>
            Triage
          </div>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="form-section-heading">
              <h2>Basic information</h2>
              <p>Enter the patient's basic identifying details.</p>
            </div>

            <div className="form-grid">
              <label className="field full-width">
                <span>Full name *</span>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField('name', event.target.value)
                  }
                  placeholder="Enter patient's full name"
                  required
                />
              </label>

              <label className="field">
                <span>Age *</span>

                <input
                  type="number"
                  min="0"
                  max="120"
                  value={form.age}
                  onChange={(event) =>
                    updateField('age', event.target.value)
                  }
                  placeholder="e.g. 42"
                  required
                />
              </label>

              <label className="field">
                <span>Gender *</span>

                <select
                  value={form.gender}
                  onChange={(event) =>
                    updateField('gender', event.target.value)
                  }
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <h2>Contact & location</h2>
              <p>Useful for continuity and follow-up.</p>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Mobile number</span>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(event) =>
                    updateField('phone', event.target.value)
                  }
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </label>

              <label className="field">
                <span>Village / locality *</span>

                <input
                  type="text"
                  value={form.village}
                  onChange={(event) =>
                    updateField('village', event.target.value)
                  }
                  placeholder="Enter village or locality"
                  required
                />
              </label>

              <label className="field full-width">
                <span>Emergency contact</span>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.emergencyContact}
                  onChange={(event) =>
                    updateField(
                      'emergencyContact',
                      event.target.value,
                    )
                  }
                  placeholder="Emergency contact number"
                  maxLength={10}
                />
              </label>
            </div>
          </section>

          <section className="consent-box">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) =>
                  setConsent(event.target.checked)
                }
              />

              <span>
                I confirm that the patient has provided consent for
                registration and healthcare screening.
              </span>
            </label>
          </section>

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={!consent}
            >
              <CheckCircle2 size={18} />
              Register patient
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default PatientRegistration