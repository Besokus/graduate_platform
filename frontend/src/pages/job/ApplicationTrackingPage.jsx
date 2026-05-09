import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { employmentApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const statuses = ['TODO', 'APPLIED', 'VIEWED', 'WRITTEN_TEST', 'INTERVIEW', 'OFFER', 'REJECTED', 'CLOSED']
const emptyForm = { companyName: '', jobTitle: '', status: 'APPLIED', appliedAt: '', nextStepAt: '', notes: '' }
const toApiPayload = form => ({ ...form, appliedAt: form.appliedAt || null, nextStepAt: form.nextStepAt || null })

export default function ApplicationTrackingPage() {
  const { token, isAuthed, loading: authLoading } = useAuth()
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRecords(await employmentApi.applications(token))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { if (isAuthed) loadRecords() }, [isAuthed, loadRecords])
  if (!authLoading && !isAuthed) return <Navigate to="/login" replace />

  async function saveRecord() { setSaving(true); setError(''); try { if (editingId) await employmentApi.updateApplication(editingId, toApiPayload(form), token); else await employmentApi.createApplication(toApiPayload(form), token); setForm(emptyForm); setEditingId(null); await loadRecords() } catch (e) { setError(e.message) } finally { setSaving(false) } }
  async function deleteRecord(id) { setError(''); try { await employmentApi.deleteApplication(id, token); await loadRecords() } catch (e) { setError(e.message) } }
  function startEdit(record) { setEditingId(record.id); setForm({ companyName: record.companyName || '', jobTitle: record.jobTitle || '', status: record.status || 'APPLIED', appliedAt: record.appliedAt ? record.appliedAt.slice(0, 16) : '', nextStepAt: record.nextStepAt ? record.nextStepAt.slice(0, 16) : '', notes: record.notes || '' }) }
  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="app"><Navbar /><main className="shell"><section className="section">
      <div className="section-head"><p className="eyebrow">Employment - Applications</p><h2>Application tracking</h2><p className="muted">Record external applications, maintain status transitions, and track next steps.</p>{error && <div className="error-text">{error}</div>}</div>
      <div className="grid-two"><div className="feature-card"><div className="card-title">{editingId ? 'Edit application' : 'New application'}</div><div className="form-grid"><label className="field"><span>Company</span><input value={form.companyName} onChange={e => updateField('companyName', e.target.value)} /></label><label className="field"><span>Job title</span><input value={form.jobTitle} onChange={e => updateField('jobTitle', e.target.value)} /></label><label className="field"><span>Status</span><select value={form.status} onChange={e => updateField('status', e.target.value)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><label className="field"><span>Applied at</span><input type="datetime-local" value={form.appliedAt} onChange={e => updateField('appliedAt', e.target.value)} /></label><label className="field"><span>Next step</span><input type="datetime-local" value={form.nextStepAt} onChange={e => updateField('nextStepAt', e.target.value)} /></label><label className="field"><span>Notes</span><textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} /></label></div><button className="btn primary" type="button" onClick={saveRecord} disabled={saving}>{saving ? 'Saving...' : 'Save record'}</button>{editingId && <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel edit</button>}</div>
      <div className="feature-card metrics"><div className="card-title">Status values</div><div className="tag-row">{statuses.map(item => <span className="tag subtle" key={item}>{item}</span>)}</div></div></div>
      <div className="track-grid">{loading && <div className="track-card"><p className="muted">Loading applications...</p></div>}{!loading && records.length === 0 && <div className="track-card"><p className="muted">No application records yet.</p></div>}{records.map(record => <div className="track-card" key={record.id}><div className="track-head"><h3>{record.companyName}</h3><span className="tag subtle">{record.status}</span></div><p className="muted">{record.jobTitle} - Applied: {record.appliedAt || 'Not set'}</p><p>{record.notes || 'No notes'}</p><button className="btn outline small" type="button" onClick={() => startEdit(record)}>Edit</button><button className="btn ghost small" type="button" onClick={() => deleteRecord(record.id)}>Delete</button></div>)}</div>
      <Link className="btn ghost" to="/job">Back to employment panel</Link>
    </section></main><Footer /></div>
  )
}
