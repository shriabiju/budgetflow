import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../api.js'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function register() {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    setError('')
    setSuccess('')

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: trimmedPassword }),
      })

      if (response.ok) {
        setSuccess('Account created! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        const msg = await response.text()
        setError(msg.includes('Email') ? 'Email already registered.' : 'Registration failed.')
      }
    } catch (err) {
      setError('Server error. Make sure backend is running.')
    }
  }

  useEffect(() => {
    function handleKeyPress(e) {
      if (e.key === 'Enter') register()
    }
    document.addEventListener('keypress', handleKeyPress)
    return () => document.removeEventListener('keypress', handleKeyPress)
  })

  useEffect(() => {
    document.title = 'Register | BudgetFlow'
    document.body.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
    document.body.style.minHeight = '100vh'
    document.body.style.display = 'flex'
    document.body.style.alignItems = 'center'
    document.body.style.justifyContent = 'center'
    document.body.style.fontFamily = "'Segoe UI', sans-serif"
    return () => {
      document.body.removeAttribute('style')
    }
  }, [])

  return (
    <div className="register-card">
      <div className="text-center">
        <div className="brand-icon">💰</div>
        <h2>Create Account</h2>
        <p>Start tracking your finances today</p>
      </div>

      {error && (
        <div className="alert-msg alert-error" style={{ display: 'block' }}>
          <i className="fas fa-exclamation-circle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-msg alert-success" style={{ display: 'block' }}>
          <i className="fas fa-check-circle me-2"></i>
          <span>{success}</span>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          className="form-control"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="btn-register" onClick={register}>
        <i className="fas fa-user-plus me-2"></i>Create Account
      </button>

      <div className="login-link">
        Already have an account? <Link to="/login">Sign in here</Link>
      </div>
    </div>
  )
}