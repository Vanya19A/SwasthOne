import { FormEvent, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, HeartPulse, Stethoscope } from 'lucide-react'
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

const symptomOptions = [
  'Fever',
  'Cough',
  'Breathing difficulty',
  'Chest discomfort',
  'Dizziness',
  'Headache',
  'Fatigue',
  'Other',
]

function Screening() {
  const navigate = useNavigate()
  const location = useLocation()

  const patient = location.state?.patient as Patient | undefined

  const [symptoms, setSymptoms] = useState<string[]>([])
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState('')

  const [hasManualVitals, setHasManualVitals] = useState(false)

  const [bloodPressure, setBloodPressure] = useState('')
  const [pulse, setPulse] = useState('')
  const [temperature, setTemperature] = useState('')
  const [oxygenSaturation, setOxygenSaturation] = useState('')

  const toggleSymptom = (symptom: string) => {
    setSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const screening: ScreeningData = {
      symptoms,
      duration,
      severity,
      hasManualVitals,
      bloodPressure: hasManualVitals ? bloodPressure : '',
      pulse: hasManualVitals ? pulse : '',
      temperature: hasManualVitals ? temperature : '',
      oxygenSaturation: hasManualVitals ? oxygenSaturation : '',
    }

    navigate('/screening/rppg', {
      state: {
        patient,
        screening,
      },
    })
  }

  return (
    <div className="page-shell">
      <main className="form-page">
        <header className="form-header">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate('/patients/profile', { state: { patient } })}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="form-heading">
            <div className="form-icon">
              <HeartPulse size={24} />
            </div>

            <div>
              <p className="eyebrow">Patient screening</p>
              <h1>Let's understand how you are feeling.</h1>
              <p>
                Tell us about your symptoms. This information will help guide
                the next screening step.
              </p>
            </div>
          </div>
        </header>

        <div className="workflow">
          <div className="workflow-step completed">
            <span><Check size={14} /></span>
            <label>Registration</label>
          </div>

          <div className="workflow-line active" />

          <div className="workflow-step active">
            <span>2</span>
            <label>Symptoms</label>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>3</span>
            <label>rPPG</label>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>4</span>
            <label>Triage</label>
          </div>
        </div>

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

        <form className="screening-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="section-heading">
              <div>
                <span className="section-number">01</span>
                <h2>What symptoms are you experiencing?</h2>
              </div>

              <p>Select all that apply.</p>
            </div>

            <div className="symptom-grid">
              {symptomOptions.map((symptom) => {
                const selected = symptoms.includes(symptom)

                return (
                  <button
                    key={symptom}
                    type="button"
                    className={`symptom-card ${selected ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    <span>{symptom}</span>

                    {selected && (
                      <span className="symptom-check">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <div>
                <span className="section-number">02</span>
                <h2>Tell us a little more</h2>
              </div>

              <p>These details are optional.</p>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>How long have you had these symptoms?</span>
                <select
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value="">Select duration</option>
                  <option value="Today">Today</option>
                  <option value="2-3 days">2–3 days</option>
                  <option value="4-7 days">4–7 days</option>
                  <option value="More than a week">More than a week</option>
                </select>
              </label>

              <label className="field">
                <span>How severe do they feel?</span>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                >
                  <option value="">Select severity</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <div>
                <span className="section-number">03</span>
                <h2>Do you have measurements from a healthcare worker?</h2>
              </div>

              <p>This step is optional.</p>
            </div>

            <div className="vitals-choice">
              <button
                type="button"
                className={`choice-card ${!hasManualVitals ? 'selected' : ''}`}
                onClick={() => setHasManualVitals(false)}
              >
                <div className="choice-radio">
                  {!hasManualVitals && <span />}
                </div>

                <div>
                  <strong>No measurements available</strong>
                  <p>Continue directly to camera-based screening.</p>
                </div>
              </button>

              <button
                type="button"
                className={`choice-card ${hasManualVitals ? 'selected' : ''}`}
                onClick={() => setHasManualVitals(true)}
              >
                <div className="choice-radio">
                  {hasManualVitals && <span />}
                </div>

                <div>
                  <strong>Yes, I have measurements</strong>
                  <p>Enter readings recorded by a healthcare worker.</p>
                </div>
              </button>
            </div>

            {hasManualVitals && (
              <div className="vitals-panel">
                <div className="vitals-heading">
                  <Stethoscope size={19} />
                  <div>
                    <h3>Recorded measurements</h3>
                    <p>Enter only measurements that are actually available.</p>
                  </div>
                </div>

                <div className="field-grid four-columns">
                  <label className="field">
                    <span>Blood pressure</span>
                    <div className="input-with-unit">
                      <input
                        type="text"
                        placeholder="120/80"
                        value={bloodPressure}
                        onChange={(event) => setBloodPressure(event.target.value)}
                      />
                      <span>mmHg</span>
                    </div>
                  </label>

                  <label className="field">
                    <span>Pulse</span>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        placeholder="72"
                        value={pulse}
                        onChange={(event) => setPulse(event.target.value)}
                      />
                      <span>bpm</span>
                    </div>
                  </label>

                  <label className="field">
                    <span>Temperature</span>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="98.6"
                        value={temperature}
                        onChange={(event) => setTemperature(event.target.value)}
                      />
                      <span>°F</span>
                    </div>
                  </label>

                  <label className="field">
                    <span>SpO₂</span>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        placeholder="98"
                        value={oxygenSaturation}
                        onChange={(event) =>
                          setOxygenSaturation(event.target.value)
                        }
                      />
                      <span>%</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </section>

          <div className="form-footer">
            <p>
              You can continue even if you do not have manual measurements.
            </p>

            <button className="primary-button" type="submit">
              Continue to screening
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Screening