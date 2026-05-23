import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studyAbroadApi } from '../../lib/api.js'
import {
  getApplicationItems,
  getTimelineItems,
  saveTimelineItems,
} from './studyAbroadStorage.js'
import '../../App.css'

const statusLabels = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done',
}

const phases = ['All phases', 'Language test', 'School selection', 'Documents', 'Submission', 'Interview', 'Visa']

const emptyForm = {
  applicationId: '',
  title: '',
  country: 'UK',
  school: '',
  phase: 'Documents',
  dueDate: '2026-09-01',
  note: '',
}

function daysLeft(dateText) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateText}T00:00:00`)
  return Math.ceil((target - today) / 86400000)
}

function createId() {
  return `timeline-${Date.now()}`
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

function toTimelinePayload(item, canUseRemote) {
  return {
    applicationId: normalizeApplicationId(item.applicationId, canUseRemote),
    title: item.title,
    country: item.country,
    school: item.school,
    phase: item.phase,
    dueDate: item.dueDate,
    status: item.status,
    note: item.note,
  }
}

export default function TimelinePage() {
  const { token } = useAuth()
  const [items, setItems] = useState(() => getTimelineItems())
  const [applications, setApplications] = useState(() => getApplicationItems())
  const [phase, setPhase] = useState('All phases')
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
          studyAbroadApi.timeline(token),
        ])
        if (active) {
          setApplications(remoteApplications)
          setItems(remoteItems)
          setSyncNote('Loaded timeline and application projects from backend.')
        }
      } catch (error) {
        if (active) {
          setSyncNote(error.message || 'Backend unavailable. Showing local demo timeline.')
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
    saveTimelineItems(nextItems)
  }

  const filteredItems = useMemo(() => {
    const nextItems = phase === 'All phases'
      ? items
      : items.filter((item) => item.phase === phase)
    return [...nextItems].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [items, phase])

  const stats = useMemo(() => {
    const done = items.filter((item) => item.status === 'done').length
    const doing = items.filter((item) => item.status === 'doing').length
    const rate = items.length ? Math.round((done / items.length) * 100) : 0
    return { done, doing, rate }
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
      country: form.country.trim() || 'Unspecified',
      school: form.school.trim() || 'School TBD',
      phase: form.phase,
      dueDate: form.dueDate,
      status: 'todo',
      note: form.note.trim() || 'No note',
    }

    if (canUseRemote) {
      try {
        const created = await studyAbroadApi.createTimeline(payload, token)
        setItems([...items, created].sort((a, b) => a.dueDate.localeCompare(b.dueDate)))
        setSyncNote('Timeline item saved to backend.')
      } catch (error) {
        setSyncNote(error.message || 'Backend save failed.')
        return
      }
    } else {
      updateLocalItems([...items, { id: createId(), ...enrichWithApplication(payload) }])
    }
    setForm({ ...emptyForm, applicationId: form.applicationId })
  }

  async function cycleStatus(targetId) {
    const order = ['todo', 'doing', 'done']
    const targetItem = items.find((item) => item.id === targetId)
    if (!targetItem) return
    const nextIndex = (order.indexOf(targetItem.status) + 1) % order.length
    const nextItem = { ...targetItem, status: order[nextIndex] }

    if (canUseRemote) {
      try {
        const updated = await studyAbroadApi.updateTimeline(targetId, toTimelinePayload(nextItem, canUseRemote), token)
        setItems(items.map((item) => (item.id === targetId ? updated : item)))
        setSyncNote('Timeline status synced to backend.')
      } catch (error) {
        setSyncNote(error.message || 'Status sync failed.')
      }
      return
    }

    updateLocalItems(items.map((item) => (item.id === targetId ? nextItem : item)))
  }

  async function removeItem(targetId) {
    if (canUseRemote) {
      try {
        await studyAbroadApi.deleteTimeline(targetId, token)
        setItems(items.filter((item) => item.id !== targetId))
        setSyncNote('Timeline item deleted from backend.')
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
              <p className="eyebrow">Study Abroad · Timeline</p>
              <h2>Application Timeline</h2>
              <p className="muted">Create timeline tasks and bind them to specific application projects.</p>
            </div>
            <Link className="btn ghost" to="/studyabroad">Back to dashboard</Link>
          </div>

          <div className="grid-two">
            <form className="feature-card" onSubmit={addItem}>
              <div className="card-title">New Timeline Item</div>
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
                <span>Item Title</span>
                <input
                  type="text"
                  value={form.title}
                  placeholder="Example: Finish second PS draft"
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <div className="grid-two compact">
                <label className="field">
                  <span>Country / Region</span>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(event) => setForm({ ...form, country: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Target School</span>
                  <input
                    type="text"
                    value={form.school}
                    placeholder="Can be left blank"
                    onChange={(event) => setForm({ ...form, school: event.target.value })}
                  />
                </label>
              </div>
              <div className="grid-two compact">
                <label className="field">
                  <span>Phase</span>
                  <select value={form.phase} onChange={(event) => setForm({ ...form, phase: event.target.value })}>
                    {phases.slice(1).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Due Date</span>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Note</span>
                <textarea
                  rows="3"
                  value={form.note}
                  placeholder="Write materials, reminders, or next actions"
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                />
              </label>
              <button className="btn primary" type="submit">Add Item</button>
            </form>

            <div className="feature-card metrics">
              <div className="card-title">Progress</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{items.length}</div>
                  <div className="mini-label">Total</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.doing}</div>
                  <div className="mini-label">Doing</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.done}</div>
                  <div className="mini-label">Done</div>
                </div>
              </div>
              <div className="progress-block">
                <div className="progress-label">Completion {stats.rate}%</div>
                <div className="progress-bar"><span style={{ width: `${stats.rate}%` }} /></div>
              </div>
              {syncNote ? <div className="notice-box"><p className="muted">{syncNote}</p></div> : null}
              <label className="field">
                <span>Phase Filter</span>
                <select value={phase} onChange={(event) => setPhase(event.target.value)}>
                  {phases.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="study-list">
            {filteredItems.map((item) => {
              const left = daysLeft(item.dueDate)
              return (
                <article className="study-row" key={item.id}>
                  <div className={`study-status ${item.status}`}>{statusLabels[item.status]}</div>
                  <div className="study-row-main">
                    <div className="study-row-title">{item.title}</div>
                    <div className="detail-meta">
                      <span>{item.country}</span>
                      <span>{item.school}</span>
                      <span>{item.phase}</span>
                      <span>{item.dueDate}</span>
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
                    <span className={`tag ${left < 0 ? 'danger' : 'subtle'}`}>
                      {left < 0 ? `${Math.abs(left)} days overdue` : `${left} days left`}
                    </span>
                    <button className="btn ghost small" type="button" onClick={() => cycleStatus(item.id)}>
                      Switch Status
                    </button>
                    <button className="btn outline small" type="button" onClick={() => removeItem(item.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
