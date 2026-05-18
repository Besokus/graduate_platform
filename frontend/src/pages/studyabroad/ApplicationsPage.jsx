import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studyAbroadApi } from '../../lib/api.js'
import {
  getApplicationItems,
  saveApplicationItems,
} from './studyAbroadStorage.js'
import '../../App.css'

const emptyForm = {
  country: 'UK',
  school: '',
  program: '',
  degree: 'Master',
  intake: '2027 Fall',
  applicationRound: 'Round 1',
  deadline: '2026-10-15',
  status: 'planning',
  priority: 'match',
  note: '',
}

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

const priorityOptions = [
  { value: 'dream', label: 'Dream' },
  { value: 'match', label: 'Match' },
  { value: 'safe', label: 'Safe' },
]

function byDeadline(a, b) {
  return a.deadline.localeCompare(b.deadline)
}

export default function ApplicationsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState(() => getApplicationItems())
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState({ status: 'all', keyword: '' })
  const [notice, setNotice] = useState('')

  const canUseRemote = Boolean(token && token !== 'dev-token')
  const dataNotice = notice || (
    canUseRemote
      ? ''
      : 'Using local demo data. Sign in with a real account to save to backend.'
  )

  useEffect(() => {
    if (!canUseRemote) {
      return undefined
    }

    let active = true
    async function loadApplications() {
      try {
        const data = await studyAbroadApi.applications(token)
        if (active) {
          setItems(data)
          setNotice('Loaded backend application projects.')
        }
      } catch (error) {
        if (active) {
          setNotice(error.message || 'Backend unavailable. Showing local demo data.')
        }
      }
    }

    loadApplications()
    return () => {
      active = false
    }
  }, [canUseRemote, token])

  const filteredItems = useMemo(() => {
    const keyword = filter.keyword.trim().toLowerCase()
    return [...items]
      .filter((item) => filter.status === 'all' || item.status === filter.status)
      .filter((item) => {
        if (!keyword) return true
        const text = `${item.country} ${item.school} ${item.program} ${item.note}`.toLowerCase()
        return text.includes(keyword)
      })
      .sort(byDeadline)
  }, [filter, items])

  const summary = useMemo(() => {
    const submitted = items.filter((item) => ['submitted', 'offer', 'rejected'].includes(item.status)).length
    const offers = items.filter((item) => item.status === 'offer').length
    const nearest = [...items].sort(byDeadline)[0]
    return { total: items.length, submitted, offers, nearest }
  }, [items])

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function saveLocal(nextItems) {
    setItems(nextItems)
    saveApplicationItems(nextItems)
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      ...form,
      school: form.school.trim(),
      program: form.program.trim(),
      note: form.note.trim(),
    }
    if (!payload.school || !payload.program) {
      setNotice('School and program are required.')
      return
    }

    try {
      if (canUseRemote) {
        const saved = editingId
          ? await studyAbroadApi.updateApplication(editingId, payload, token)
          : await studyAbroadApi.createApplication(payload, token)
        setItems((current) => {
          const next = editingId
            ? current.map((item) => (item.id === editingId ? saved : item))
            : [...current, saved]
          return next.sort(byDeadline)
        })
        setNotice(editingId ? 'Application project updated.' : 'Application project created.')
      } else {
        const saved = { ...payload, id: editingId || `local-${Date.now()}` }
        const next = editingId
          ? items.map((item) => (item.id === editingId ? saved : item))
          : [...items, saved]
        saveLocal(next.sort(byDeadline))
        setNotice(editingId ? 'Local application project updated.' : 'Local application project created.')
      }
      resetForm()
    } catch (error) {
      setNotice(error.message || 'Save failed.')
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      country: item.country,
      school: item.school,
      program: item.program,
      degree: item.degree,
      intake: item.intake,
      applicationRound: item.applicationRound,
      deadline: item.deadline,
      status: item.status,
      priority: item.priority,
      note: item.note || '',
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this application project?')) return
    try {
      if (canUseRemote) {
        await studyAbroadApi.deleteApplication(id, token)
        setItems((current) => current.filter((item) => item.id !== id))
      } else {
        saveLocal(items.filter((item) => item.id !== id))
      }
      if (editingId === id) resetForm()
      setNotice('Application project deleted.')
    } catch (error) {
      setNotice(error.message || 'Delete failed.')
    }
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Study Abroad · Applications</p>
              <h2>Application Project Tracker</h2>
              <p className="muted">
                Manage target schools, programs, rounds, deadlines, status, and priority.
              </p>
            </div>
            <Link className="btn ghost" to="/studyabroad">Back to dashboard</Link>
          </div>

          <div className="mini-grid">
            <div className="mini-card">
              <div className="mini-value">{summary.total}</div>
              <div className="mini-label">Projects</div>
            </div>
            <div className="mini-card">
              <div className="mini-value">{summary.submitted}</div>
              <div className="mini-label">Submitted</div>
            </div>
            <div className="mini-card">
              <div className="mini-value">{summary.offers}</div>
              <div className="mini-label">Offers</div>
            </div>
          </div>

          <div className="notice-box">
            <strong>Nearest deadline</strong>
            <p className="muted">
              {summary.nearest
                ? `${summary.nearest.deadline} · ${summary.nearest.school} · ${summary.nearest.program}`
                : 'No application project yet.'}
            </p>
          </div>

          {dataNotice ? (
            <div className="notice-box">
              <strong>Data source</strong>
          <p className="muted">{dataNotice}</p>
        </div>
      ) : null}

          <form className="feature-card" onSubmit={handleSubmit}>
            <div className="section-head compact">
              <h2>{editingId ? 'Edit Application Project' : 'New Application Project'}</h2>
              <button className="btn outline small" type="button" onClick={resetForm}>Clear</button>
            </div>
            <div className="filter-grid">
              <label className="field">
                <span>Country / Region</span>
                <input value={form.country} onChange={(event) => updateForm('country', event.target.value)} />
              </label>
              <label className="field">
                <span>School</span>
                <input value={form.school} onChange={(event) => updateForm('school', event.target.value)} />
              </label>
              <label className="field">
                <span>Program</span>
                <input value={form.program} onChange={(event) => updateForm('program', event.target.value)} />
              </label>
              <label className="field">
                <span>Degree</span>
                <input value={form.degree} onChange={(event) => updateForm('degree', event.target.value)} />
              </label>
              <label className="field">
                <span>Intake</span>
                <input value={form.intake} onChange={(event) => updateForm('intake', event.target.value)} />
              </label>
              <label className="field">
                <span>Round</span>
                <input
                  value={form.applicationRound}
                  onChange={(event) => updateForm('applicationRound', event.target.value)}
                />
              </label>
              <label className="field">
                <span>Deadline</span>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) => updateForm('deadline', event.target.value)}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                  {statusOptions.map((item) => (
                    <option value={item.value} key={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <select value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>
                  {priorityOptions.map((item) => (
                    <option value={item.value} key={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Note</span>
              <textarea
                rows="3"
                value={form.note}
                onChange={(event) => updateForm('note', event.target.value)}
              />
            </label>
            <button className="btn primary" type="submit">
              {editingId ? 'Save Changes' : 'Create Project'}
            </button>
          </form>

          <div className="feature-card">
            <div className="filter-grid">
              <label className="field">
                <span>Status Filter</span>
                <select value={filter.status} onChange={(event) => setFilter({ ...filter, status: event.target.value })}>
                  <option value="all">All</option>
                  {statusOptions.map((item) => (
                    <option value={item.value} key={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Keyword</span>
                <input
                  value={filter.keyword}
                  placeholder="Search school, program, country, note"
                  onChange={(event) => setFilter({ ...filter, keyword: event.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="study-list">
            {filteredItems.map((item) => (
              <article className="study-row" key={item.id}>
                <div className="study-row-main">
                  <div className="study-row-title">{item.school}</div>
                  <p className="muted">{item.program} · {item.degree} · {item.intake}</p>
                  <div className="tag-row">
                    <span className="tag subtle">{item.country}</span>
                    <span className="tag subtle">{item.applicationRound}</span>
                    <span className="tag subtle">{item.priority}</span>
                  </div>
                  <p className="muted">{item.note}</p>
                </div>
                <span className={`study-status ${item.status === 'offer' ? 'done' : 'doing'}`}>
                  {item.status}
                </span>
                <div className="study-row-side">
                  <span className="tag subtle">{item.deadline}</span>
                  <button className="btn outline small" type="button" onClick={() => startEdit(item)}>Edit</button>
                  <button className="btn outline small" type="button" onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
