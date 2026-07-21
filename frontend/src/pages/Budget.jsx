import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import Navbar from '../components/Navbar.jsx'
import { API_BASE } from '../api.js'

ChartJS.register(ArcElement, Tooltip, Legend)

function getMonthOptions() {
  const options = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' })
    options.push({ value, label })
  }
  return options
}

export default function Budget() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')

  const monthOptions = getMonthOptions()
  const [month, setMonth] = useState(monthOptions[0]?.value || '')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const [budget, setBudget] = useState(0)
  const [spent, setSpent] = useState(0)

  useEffect(() => {
    if (!userId) navigate('/login')
  }, [userId, navigate])

  useEffect(() => {
    document.title = 'Budget | BudgetFlow'
    document.body.style.background = '#0f0f1a'
    document.body.style.color = '#fff'
    document.body.style.fontFamily = "'Segoe UI', sans-serif"
    return () => document.body.removeAttribute('style')
  }, [])

  useEffect(() => {
    if (!userId || !month) return
    loadBudgetOverview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  async function saveBudget() {
    if (!monthlyLimit || monthlyLimit <= 0) {
      alert('Please enter a valid budget amount.')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyLimit: parseFloat(monthlyLimit), month, userId: parseInt(userId, 10) }),
      })

      if (res.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        loadBudgetOverview()
      }
    } catch (e) {
      console.error('Error saving budget:', e)
    }
  }

  async function loadBudgetOverview() {
    try {
      const budgetRes = await fetch(`${API_BASE}/api/budgets/user/${userId}/month/${month}`)
      const spentRes = await fetch(`${API_BASE}/api/expenses/user/${userId}/total`)

      let budgetVal = 0
      let spentVal = 0

      if (budgetRes.ok) {
        const budgetData = await budgetRes.json()
        budgetVal = budgetData.monthlyLimit || 0
      }

      if (spentRes.ok) {
        spentVal = (await spentRes.json()) || 0
      }

      setBudget(budgetVal)
      setSpent(spentVal)
    } catch (e) {
      console.error('Budget overview error:', e)
    }
  }

  const remaining = Math.max(budget - spent, 0)
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const progressBackground = percent > 80
    ? 'linear-gradient(135deg, #ff6363, #ff9f43)'
    : 'linear-gradient(135deg, #4cc9f0, #4361ee)'

  const doughnutData = {
    labels: ['Spent', 'Remaining'],
    datasets: [{ data: [spent, remaining], backgroundColor: ['#ff6363', '#4cc996'], borderWidth: 0 }],
  }
  const doughnutOptions = {
    plugins: { legend: { labels: { color: '#fff', font: { size: 13 } } } },
    cutout: '70%',
  }

  return (
    <>
      <Navbar active="budget" />
      <div className="main-content">
        <div className="page-title">🎯 Budget Manager</div>
        <div className="page-sub">Set and monitor your monthly budget</div>

        <div className="row g-4">
          {/* Set Budget Form */}
          <div className="col-md-4">
            <div className="card-dark">
              <div className="section-title">
                <i className="fas fa-sliders-h me-2"></i>Set Monthly Budget
              </div>

              <div className="mb-3">
                <label className="form-label">Select Month</label>
                <select className="form-select" value={month} onChange={(e) => setMonth(e.target.value)}>
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Monthly Limit (₹)</label>
                <input type="number" className="form-control" placeholder="e.g. 10000"
                  value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} />
              </div>

              <button className="btn-save" onClick={saveBudget}>
                <i className="fas fa-save me-2"></i>Save Budget
              </button>

              {showSuccess && (
                <div className="alert-success-dark" style={{ display: 'block' }}>
                  <i className="fas fa-check-circle me-2"></i>Budget saved successfully!
                </div>
              )}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="col-md-8">
            <div className="card-dark">
              <div className="section-title">
                <i className="fas fa-chart-pie me-2"></i>Budget Overview
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="stat-card" style={{ borderLeft: '4px solid #4cc9f0' }}>
                    <div className="stat-label">Monthly Budget</div>
                    <div className="stat-value">₹{budget.toFixed(2)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card" style={{ borderLeft: '4px solid #ff6363' }}>
                    <div className="stat-label">Total Spent</div>
                    <div className="stat-value">₹{spent.toFixed(2)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card" style={{ borderLeft: '4px solid #4cc996' }}>
                    <div className="stat-label">Remaining</div>
                    <div className="stat-value">₹{remaining.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Budget Used</span>
                  <span style={{ color: '#4cc9f0', fontSize: '14px' }}>{percent.toFixed(1)}%</span>
                </div>
                <div className="progress-custom">
                  <div className="progress-bar-custom" style={{ width: `${percent}%`, background: progressBackground }}></div>
                </div>
                <div className="progress-label">
                  <span>₹{spent.toFixed(2)} spent</span>
                  <span>₹{budget.toFixed(2)} limit</span>
                </div>
              </div>

              {/* Doughnut Chart */}
              <div className="mt-4" style={{ maxWidth: '280px', margin: '0 auto' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}