import { useNavigate, Link } from 'react-router-dom'

export default function Navbar({ active }) {
  const navigate = useNavigate()

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg">
      <span className="navbar-brand">💰 BudgetFlow</span>
      <div className="ms-auto d-flex align-items-center">
        <Link to="/dashboard" className={`nav-link ${active === 'dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/expenses" className={`nav-link ${active === 'expenses' ? 'active' : ''}`}>Expenses</Link>
        <Link to="/budget" className={`nav-link ${active === 'budget' ? 'active' : ''}`}>Budget</Link>
        <button className="btn-logout ms-3" onClick={logout}>
          <i className="fas fa-sign-out-alt me-1"></i>Logout
        </button>
      </div>
    </nav>
  )
}