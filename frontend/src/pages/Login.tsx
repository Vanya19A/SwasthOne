import {useState } from 'react'
import type { SubmitEvent } from 'react'
import { Activity, LockKeyhole, Phone, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type UserRole = 'patient' | 'asha' | 'doctor'

function Login() {
  const navigate = useNavigate()

  const [role, setRole] = useState<UserRole>('patient')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    localStorage.setItem('swasthone_role', role)

    /*
     * Frontend-only prototype.
     * Real authentication will be connected to the backend API later.
     */
    if (role === 'asha') {
      navigate('/asha')
      return
    }

    if (role === 'doctor') {
      navigate('/doctor')
      return
    }

    navigate('/patient')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Activity size={24} />
          </div>

          <div>
            <strong>SwasthOne</strong>
            <span>Healthcare, closer to you</span>
          </div>
        </div>

        <div className="login-heading">
          <p className="section-kicker">Secure access</p>
          <h1>Welcome back</h1>
          <p>
            Sign in to continue your healthcare workflow.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="role">Continue as</label>

            <select
              id="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as UserRole)
              }
            >
              <option value="patient">Patient</option>
              <option value="asha">ASHA / ANM</option>
              <option value="doctor">Doctor / Medical Officer</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="identifier">Phone number or email</label>

            <div className="input-with-icon">
              <Phone size={18} />

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
                placeholder="Enter phone number or email"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>

            <div className="input-with-icon">
              <LockKeyhole size={18} />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button className="login-button" type="submit">
            Sign in
          </button>
        </form>

        <div className="login-security">
          <ShieldCheck size={18} />

          <div>
            <strong>Protected healthcare access</strong>
            <span>
              Your healthcare information should only be accessed by
              authorized users.
            </span>
          </div>
        </div>

        <button
          className="login-back-button"
          type="button"
          onClick={() => navigate('/')}
        >
          ← Back to dashboard
        </button>
      </div>
    </div>
  )
}

export default Login