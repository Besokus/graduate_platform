import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { employmentApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const emptyFilters = { city: '', industry: '', roleType: '' }

export default function JobRecommendPage() {
  const { token, isAuthed, loading: authLoading } = useAuth()
  const [filters, setFilters] = useState(emptyFilters)
  const [recommendations, setRecommendations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async (nextFilters = emptyFilters) => {
    setLoading(true)
    setError('')
    try {
      setRecommendations(await employmentApi.recommendations(nextFilters, token))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthed) return
    refresh()
    employmentApi.notifications(token).then(setNotifications).catch(e => setError(e.message))
  }, [isAuthed, token, refresh])
  if (!authLoading && !isAuthed) return <Navigate to="/login" replace />

  async function markRead(id) { try { const updated = await employmentApi.markNotificationRead(id, token); setNotifications(prev => prev.map(item => (item.id === id ? updated : item))) } catch (e) { setError(e.message) } }
  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))

  return (
    <div className="app"><Navbar /><main className="shell"><section className="section">
      <div className="section-head"><p className="eyebrow">Employment - Rule recommendations</p><h2>Matched job postings</h2><p className="muted">Deterministic matching by city, industry, role, major, and resume skills. No external recruitment service is called.</p>{error && <div className="error-text">{error}</div>}</div>
      <div className="grid-two"><div className="feature-card"><div className="card-title">Filters</div><div className="form-grid"><label className="field"><span>City</span><input value={filters.city} onChange={e => updateFilter('city', e.target.value)} placeholder="Shanghai" /></label><label className="field"><span>Industry</span><input value={filters.industry} onChange={e => updateFilter('industry', e.target.value)} placeholder="Internet" /></label><label className="field"><span>Role</span><input value={filters.roleType} onChange={e => updateFilter('roleType', e.target.value)} placeholder="Backend" /></label></div><button className="btn primary" type="button" onClick={() => refresh(filters)}>Refresh recommendations</button></div>
      <div className="feature-card metrics"><div className="card-title">Station notifications</div>{notifications.length === 0 && <p className="muted">No employment notifications yet.</p>}{notifications.slice(0, 4).map(item => <div className="room-row" key={item.id}><div><div className="room-title">{item.title}</div><div className="room-sub">{item.content}</div></div>{item.readFlag ? <span className="tag subtle">Read</span> : <button className="btn outline small" type="button" onClick={() => markRead(item.id)}>Mark read</button>}</div>)}</div></div>
      <div className="track-grid">{loading && <div className="track-card"><p className="muted">Calculating matches...</p></div>}{!loading && recommendations.length === 0 && <div className="track-card"><p className="muted">No matches yet. Save preferences or complete your resume.</p></div>}{recommendations.map(job => <div className="track-card" key={job.id}><div className="track-head"><h3>{job.title}</h3><span className="tag subtle">Score {job.matchScore}</span></div><p className="muted">{job.companyName} - {job.city || 'TBD'} - {job.industry || 'TBD'} - {job.salaryRange || 'Negotiable'}</p><p>{job.description || 'No description yet.'}</p><div className="tag-row">{(job.matchReasons || []).map(reason => <span className="tag subtle" key={reason}>{reason}</span>)}</div>{job.applyUrl && <a className="btn primary small" href={job.applyUrl} target="_blank" rel="noreferrer">Open application link</a>}</div>)}</div>
      <Link className="btn ghost" to="/job">Back to employment panel</Link>
    </section></main><Footer /></div>
  )
}
