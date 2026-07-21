import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { API_BASE } from '../api.js'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health']

const CATEGORY_COLORS = {
  Food: '#f59e0b', Travel: '#4cc9f0', Shopping: '#a855f7',
  Bills: '#ff6363', Entertainment: '#4361ee', Health: '#4cc996',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Expenses() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')

  const [allExpenses, setAllExpenses] = useState([])
  const [filterCategory, setFilterCategory] = useState('')

  // Add form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')

  // Edit modal state
  const [editing, setEditing] = useState(null) // holds the expense object being edited, or null

  useEffect(() => {
    if (!userId) navigate('/login')
  }, [userId, navigate])

  useEffect(() => {
    document.title = 'Expenses | BudgetFlow'
    document.body.style.background = '#0f0f1a'
    document.body.style.color = '#fff'
    document.body.style.fontFamily = "'Segoe UI', sans-serif"
    document.body.style.margin = '0'
    return () => document.body.removeAttribute('style')
  }, [])

  useEffect(() => {
    loadExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadExpenses() {
    try {
      const res = await fetch(`${API_BASE}/api/expenses/user/${userId}`)
      const data = await res.json()
      setAllExpenses(data)
    } catch (e) {
      console.error('Error loading expenses:', e)
    }
  }

  async function addExpense() {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle || !amount || !category || !date) {
      alert('Please fill all required fields.')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle, amount: parseFloat(amount), category, date,
          description: trimmedDescription, userId: parseInt(userId, 10),
        }),
      })
      if (res.ok) {
        setTitle('')
        setAmount('')
        setCategory('')
        setDescription('')
        setDate(todayISO())
        loadExpenses()
      }
    } catch (e) {
      console.error('Error adding expense:', e)
    }
  }

  function openEdit(id) {
    const e = allExpenses.find((x) => x.id === id)
    if (!e) return
    setEditing({ ...e, amount: String(e.amount) })
  }

  async function updateExpense() {
    if (!editing) return
    try {
      const res = await fetch(`${API_BASE}/api/expenses/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editing.title.trim(),
          amount: parseFloat(editing.amount),
          category: editing.category,
          date: editing.date,
          description: (editing.description || '').trim(),
          userId: parseInt(userId, 10),
        }),
      })
      if (res.ok) {
        setEditing(null)
        loadExpenses()
      }
    } catch (e) {
      console.error('Error updating:', e)
    }
  }

  async function deleteExpense(id) {
    if (!window.confirm('Delete this expense?')) return
    try {
      await fetch(`${API_BASE}/api/expenses/${id}`, { method: 'DELETE' })
      loadExpenses()
    } catch (e) {
      console.error('Error deleting:', e)
    }
  }

  const filteredExpenses = filterCategory
    ? allExpenses.filter((e) => e.category === filterCategory)
    : allExpenses

  return (
    <>
      <Navbar active="expenses" />
      <div className="main-content">
        <div className="page-title">💸 Expense Manager</div>
        <div className="page-sub">Add, edit and track your expenses</div>

        <div className="row g-4">
          {/* Add Expense Form */}
          <div className="col-md-4">
            <div className="card-dark">
              <div className="section-title mb-4">
                <i className="fas fa-plus-circle me-2"></i>Add Expense
              </div>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input type="text" className="form-control" placeholder="e.g. Lunch"
                  value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Amount (₹)</label>
                <input type="number" className="form-control" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="form-label">Description</label>
                <input type="text" className="form-control" placeholder="Optional"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <button className="btn-add" onClick={addExpense}>
                <i className="fas fa-plus me-2"></i>Add Expense
              </button>
            </div>
          </div>

          {/* Expense Table */}
          <div className="col-md-8">
            <div className="card-dark">
              <div className="section-title mb-3">
                <i className="fas fa-list me-2"></i>All Expenses
              </div>

              <div className="filter-bar">
                <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="expense-table-wrapper">
                <table className="expense-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty-state">
                            <i className="fas fa-receipt fa-2x mb-3"></i>
                            <p>No expenses found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((e) => {
                        const color = CATEGORY_COLORS[e.category] || '#666'
                        return (
                          <tr key={e.id}>
                            <td>
                              <strong style={{ color: '#fff' }}>{e.title}</strong><br />
                              <small style={{ color: 'rgba(255,255,255,0.4)' }}>{e.description || ''}</small>
                            </td>
                            <td><strong style={{ color: '#fff' }}>₹{e.amount.toFixed(2)}</strong></td>
                            <td>
                              <span className="category-badge" style={{
                                background: `${color}22`, color, border: `1px solid ${color}44`,
                              }}>
                                {e.category}
                              </span>
                            </td>
                            <td style={{ color: '#fff' }}>{e.date}</td>
                            <td>
                              <button className="btn-edit me-1" onClick={() => openEdit(e.id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn-delete" onClick={() => deleteExpense(e.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" style={{ color: '#fff' }}>Edit Expense</h5>
                  <button type="button" className="btn-close" onClick={() => setEditing(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-control" value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" className="form-control" value={editing.amount}
                      onChange={(e) => setEditing({ ...editing, amount: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={editing.date}
                      onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" value={editing.description || ''}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                  <button className="btn-add" style={{ width: 'auto', padding: '8px 20px' }} onClick={updateExpense}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  )
}