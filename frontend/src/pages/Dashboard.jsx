import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import Navbar from '../components/Navbar.jsx'
import { API_BASE } from '../api.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const COLORS = ['#4cc9f0', '#4361ee', '#a855f7', '#ff6363', '#4cc996', '#f59e0b']

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

export default function Dashboard() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName')

  const monthOptions = getMonthOptions()
  const [month, setMonth] = useState(monthOptions[0]?.value || '')
  const [totalSpent, setTotalSpent] = useState(0)
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [remainingBudget, setRemainingBudget] = useState(0)
  const [topCategory, setTopCategory] = useState('-')
  const [categories, setCategories] = useState({})

  useEffect(() => {
    if (!userId) navigate('/login')
  }, [userId, navigate])

  useEffect(() => {
    document.title = 'Dashboard | BudgetFlow'
    document.body.style.background = '#0f0f1a'
    document.body.style.color = '#fff'
    document.body.style.fontFamily = "'Segoe UI', sans-serif"
    return () => document.body.removeAttribute('style')
  }, [])

  useEffect(() => {
    if (!userId || !month) return
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  async function loadDashboard() {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/user/${userId}/month/${month}`)
      const data = await res.json()

      setTotalSpent(data.totalMonthlySpending || 0)
      setMonthlyBudget(data.monthlyBudget || 0)
      setRemainingBudget(data.remainingBudget || 0)

      const cats = data.categoryWiseSpending || {}
      const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]
      setTopCategory(topCat ? topCat[0] : '-')
      setCategories(cats)
    } catch (e) {
      console.error('Dashboard load error:', e)
    }
  }

  const labels = Object.keys(categories)
  const values = Object.values(categories)

  const doughnutData = {
    labels,
    datasets: [{ data: values, backgroundColor: COLORS, borderWidth: 0 }],
  }
  const doughnutOptions = {
    plugins: { legend: { labels: { color: '#fff', font: { size: 12 } } } },
  }

  const barData = {
    labels,
    datasets: [{ label: 'Amount Spent (₹)', data: values, backgroundColor: COLORS, borderRadius: 8 }],
  }
  const barOptions = {
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: {
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  }

  return (
    <>
      <Navbar active="dashboard" />
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="welcome-text">Hello, <span>{userName || 'User'}</span> 👋</div>
            <div className="welcome-sub">Here's your financial overview</div>
          </div>
          <select className="month-selector" value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="row g-4">
          <div className="col-md-3">
            <div className="stat-card blue">
              <div className="stat-icon">💸</div>
              <div className="stat-label">Total Spent This Month</div>
              <div className="stat-value">₹{totalSpent.toFixed(2)}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card green">
              <div className="stat-icon">🎯</div>
              <div className="stat-label">Monthly Budget</div>
              <div className="stat-value">₹{monthlyBudget.toFixed(2)}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card purple">
              <div className="stat-icon">💰</div>
              <div className="stat-label">Remaining Budget</div>
              <div className="stat-value">₹{remainingBudget.toFixed(2)}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card red">
              <div className="stat-icon">📊</div>
              <div className="stat-label">Top Category</div>
              <div className="stat-value">{topCategory}</div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-5">
            <div className="chart-card">
              <div className="chart-title">📊 Category-wise Spending</div>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
          <div className="col-md-7">
            <div className="chart-card">
              <div className="chart-title">📈 Spending by Category</div>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}