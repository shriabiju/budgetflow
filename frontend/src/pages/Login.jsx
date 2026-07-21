import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../api.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function login() {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.')
      return
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/users/login?email=${encodeURIComponent(trimmedEmail)}&password=${encodeURIComponent(trimmedPassword)}`,
        { method: 'POST' }
      )

      if (response.ok) {
        const user = await response.json()
        localStorage.setItem('userId', user.id)
        localStorage.setItem('userName', user.name)
        navigate('/dashboard')
      } else {
        setError('Invalid email or password.')
      }
    } catch (err) {
      setError('Server error. Make sure backend is running.')
    }
  }

  useEffect(() => {
    function handleKeyPress(e) {
      if (e.key === 'Enter') login()
    }
    document.addEventListener('keypress', handleKeyPress)
    return () => document.removeEventListener('keypress', handleKeyPress)
  })

  useEffect(() => {
    document.title = 'Login | BudgetFlow'
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
    <div className="login-card">
      <div className="text-center">
        <div className="brand-icon">💰</div>
        <h2>Welcome Back</h2>
        <p>Sign in to your finance dashboard</p>
      </div>

      {error && (
        <div className="alert-error" style={{ display: 'block' }}>
          <i className="fas fa-exclamation-circle me-2"></i>
          <span>{error}</span>
        </div>
      )}

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
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="btn-login" onClick={login}>
        <i className="fas fa-sign-in-alt me-2"></i>Sign In
      </button>

      <div className="register-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  )
}