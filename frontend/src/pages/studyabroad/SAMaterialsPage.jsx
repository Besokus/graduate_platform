import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studyAbroadApi } from '../../lib/api.js'
import {
  getApplicationItems,
  getMaterialItems,
  saveMaterialItems,
} from './studyAbroadStorage.js'
import '../../App.css'

const countries = ['All countries', 'General', 'UK', 'US', 'Australia', 'Canada', 'Singapore']
const stages = ['All stages', 'Identity', 'Academic', 'Language test', 'Documents', 'Submission', 'Visa']

const emptyForm = {
  applicationId: '',
  title: '',
  country: 'General',
  stage: 'Documents',
  category: 'Writing',
  deadline: '2026-08-01',
  note: '',
}

function createId() {
  return `material-${Date.now()}`
}

function appLabel(app) {
  return `${app.school} · ${app.program}`
}

function findApplication(applications, id) {
  return applications.find((item) => String(item.id) === String(id))
}

function normalizeApplicationId(value, canUseRemote) {
  if (!value) return null
  return canUseRemote ? Number(value) : value
}

function toMaterialPayload(item, canUseRemote) {
  return {
    applicationId: normalizeApplicationId(item.applicationId, canUseRemote),
    title: item.title,
    country: item.country,
    stage: item.stage,
    category: item.category,
    deadline: item.deadline,
    completed: item.completed,
    note: item.note,
  }
}

export default function SAMaterialsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState(() => getMaterialItems())
  const [applications, setApplications] = useState(() => getApplicationItems())
  const [filters, setFilters] = useState({ country: 'All countries', stage: 'All stages', keyword: '' })
  const [syncNote, setSyncNote] = useState('')
  const [form, setForm] = useState(emptyForm)

  const canUseRemote = Boolean(token && token !== 'dev-token')

  useEffect(() => {
    if (!canUseRemote) {
      return undefined
    }
    let active = true

    async function loadRemoteData() {
      try {
        const [remoteApplications, remoteItems] = await Promise.all([
          studyAbroadApi.applications(token),
          studyAbroadApi.materials(token),
        ])
        if (active) {
          setApplications(remoteApplications)
          setItems(remoteItems)
          setSyncNote('Loaded materials and application projects from backend.')
        }
      } catch (error) {
        if (active) {
          setSyncNote(error.message || 'Backend unavailable. Showing local demo materials.')
        }
      }
    }

    loadRemoteData()
    return () => {
      active = false
    }
  }, [canUseRemote, token])

  function updateLocalItems(nextItems) {
    setItems(nextItems)
    saveMaterialItems(nextItems)
  }

  const filteredItems = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return items.filter((item) => {
      const matchCountry = filters.country === 'All countries' || item.country === filters.country
      const matchStage = filters.stage === 'All stages' || item.stage === filters.stage
      const text = `${item.title} ${item.category} ${item.note} ${item.applicationSchool || ''}`.toLowerCase()
      const matchKeyword = !keyword || text.includes(keyword)
      return matchCountry && matchStage && matchKeyword
    })
  }, [items, filters])

  const stats = useMemo(() => {
    const completed = items.filter((item) => item.completed).length
    const rate = items.length ? Math.round((completed / items.length) * 100) : 0
    return { completed, rate }
  }, [items])

  function enrichWithApplication(payload) {
    const app = findApplication(applications, payload.applicationId)
    return {
      ...payload,
      applicationSchool: app?.school || null,
      applicationProgram: app?.program || null,
    }
  }

  async function addItem(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) return

    const payload = {
      applicationId: normalizeApplicationId(form.applicationId, canUseRemote),
      title,
      country: form.country,
      stage: form.stage,
      category: form.category.trim() || 'Other',
      deadline: form.deadline,
      completed: false,
      note: form.note.trim() || 'No note',
    }

    if (canUseRemote) {
      try {
        const created = await studyAbroadApi.createMaterial(payload, token)
        setItems([...items, created].sort((a, b) => a.deadline.localeCompare(b.deadline)))
        setSyncNote('Material item saved to backend.')
      } catch (error) {
        setSyncNote(error.message || 'Backend save failed.')
        return
      }
    } else {
      updateLocalItems([...items, { id: createId(), ...enrichWithApplication(payload) }])
    }
    setForm({ ...emptyForm, applicationId: form.applicationId })
  }

  async function toggleCompleted(targetId) {
    const targetItem = items.find((item) => item.id === targetId)
    if (!targetItem) return
    const nextItem = { ...targetItem, completed: !targetItem.completed }

    if (canUseRemote) {
      try {
        const updated = await studyAbroadApi.updateMaterial(targetId, toMaterialPayload(nextItem, canUseRemote), token)
        setItems(items.map((item) => (item.id === targetId ? updated : item)))
        setSyncNote('Material status synced to backend.')
      } catch (error) {
        setSyncNote(error.message || 'Material status sync failed.')
      }
      return
    }

    updateLocalItems(items.map((item) => (item.id === targetId ? nextItem : item)))
  }

  async function removeItem(targetId) {
    if (canUseRemote) {
      try {
        await studyAbroadApi.deleteMaterial(targetId, token)
        setItems(items.filter((item) => item.id !== targetId))
        setSyncNote('Material item deleted from backend.')
      } catch (error) {
        setSyncNote(error.message || 'Delete failed.')
      }
      return
    }
    updateLocalItems(items.filter((item) => item.id !== targetId))
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Study Abroad · Materials</p>
              <h2>Application Material Checklist</h2>
              <p className="muted">Track materials by country, stage, and linked application project.</p>
            </div>
            <Link className="btn ghost" to="/studyabroad">Back to dashboard</Link>
          </div>

          <div className="grid-two">
            <form className="feature-card" onSubmit={addItem}>
              <div className="card-title">New Material</div>
              <label className="field">
                <span>Application Project</span>
                <select
                  value={form.applicationId}
                  onChange={(event) => setForm({ ...form, applicationId: event.target.value })}
                >
                  <option value="">General / not linked</option>
                  {applications.map((item) => (
                    <option key={item.id} value={String(item.id)}>{appLabel(item)}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Material Name</span>
                <input
                  type="text"
                  value={form.title}
                  placeholder="Example: Second recommendation letter"
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <div className="grid-two compact">
                <label className="field">
                  <span>Country / Region</span>
                  <select value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })}>
                    {countries.slice(1).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Stage</span>
                  <select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>
                    {stages.slice(1).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid-two compact">
                <label className="field">
                  <span>Category</span>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Deadline</span>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Note</span>
                <textarea
                  rows="3"
                  value={form.note}
                  placeholder="Record format, stamp, owner, or submission notes"
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                />
              </label>
              <button className="btn primary" type="submit">Add Material</button>
            </form>

            <div className="feature-card metrics">
              <div className="card-title">Material Progress</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{items.length}</div>
                  <div className="mini-label">Total</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.completed}</div>
                  <div className="mini-label">Done</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.rate}%</div>
                  <div className="mini-label">Completion</div>
                </div>
              </div>
              <div className="progress-block">
                <div className="progress-label">Completion {stats.rate}%</div>
                <div className="progress-bar alt"><span style={{ width: `${stats.rate}%` }} /></div>
              </div>
              {syncNote ? <div className="notice-box"><p className="muted">{syncNote}</p></div> : null}
              <div className="filter-grid">
                <label className="field">
                  <span>Country Filter</span>
                  <select
                    value={filters.country}
                    onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                  >
                    {countries.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Stage Filter</span>
                  <select
                    value={filters.stage}
                    onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
                  >
                    {stages.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Keyword</span>
                <input
                  type="text"
                  value={filters.keyword}
                  placeholder="Search material, category, project, or note"
                  onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="study-list">
            {filteredItems.map((item) => (
              <article className={`study-row ${item.completed ? 'is-complete' : ''}`} key={item.id}>
                <label className="study-check">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleCompleted(item.id)}
                  />
                  <span>{item.completed ? 'Done' : 'Pending'}</span>
                </label>
                <div className="study-row-main">
                  <div className="study-row-title">{item.title}</div>
                  <div className="detail-meta">
                    <span>{item.country}</span>
                    <span>{item.stage}</span>
                    <span>{item.category}</span>
                    <span>{item.deadline}</span>
                  </div>
                  {item.applicationSchool ? (
                    <div className="tag-row">
                      <span className="tag subtle">{item.applicationSchool}</span>
                      <span className="tag subtle">{item.applicationProgram}</span>
                    </div>
                  ) : null}
                  <p className="muted">{item.note}</p>
                </div>
                <div className="study-row-side">
                  <button className="btn outline small" type="button" onClick={() => removeItem(item.id)}>
                    Delete
                  </button>
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
