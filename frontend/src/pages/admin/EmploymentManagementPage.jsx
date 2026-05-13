import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { adminEmploymentApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const emptyFair = { title: '', companyName: '', city: '', industry: '', targetRoles: '', location: '', startTime: '', endTime: '', applyDeadline: '', applyUrl: '', description: '', active: true }
const emptyJob = { title: '', companyName: '', city: '', industry: '', roleType: '', salaryRange: '', educationRequirement: '', majorKeywords: '', skillTags: '', description: '', applyUrl: '', active: true }
const normalizeDateFields = (payload, keys) => { const next = { ...payload }; keys.forEach(key => { next[key] = next[key] || null }); return next }

export default function EmploymentManagementPage() {
  const { user, token, isAuthed, loading: authLoading } = useAuth()
  const [fairs, setFairs] = useState([])
  const [jobs, setJobs] = useState([])
  const [fairForm, setFairForm] = useState(emptyFair)
  const [jobForm, setJobForm] = useState(emptyJob)
  const [editingFairId, setEditingFairId] = useState(null)
  const [editingJobId, setEditingJobId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [fairData, jobData] = await Promise.all([
        adminEmploymentApi.fairs(token),
        adminEmploymentApi.jobs(token),
      ])
      setFairs(fairData)
      setJobs(jobData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { if (isAuthed && user?.role === 'admin') loadAll() }, [isAuthed, user?.role, loadAll])
  if (!authLoading && (!isAuthed || user?.role !== 'admin')) return <Navigate to="/login" replace />

  async function saveFair() { setError(''); setMessage(''); try { const payload = normalizeDateFields(fairForm, ['startTime', 'endTime', 'applyDeadline']); if (editingFairId) await adminEmploymentApi.updateFair(editingFairId, payload, token); else await adminEmploymentApi.createFair(payload, token); setFairForm(emptyFair); setEditingFairId(null); setMessage('Career fair saved.'); await loadAll() } catch (e) { setError(e.message) } }
  async function saveJob() { setError(''); setMessage(''); try { if (editingJobId) await adminEmploymentApi.updateJob(editingJobId, jobForm, token); else await adminEmploymentApi.createJob(jobForm, token); setJobForm(emptyJob); setEditingJobId(null); setMessage('Job posting saved.'); await loadAll() } catch (e) { setError(e.message) } }
  async function triggerNotification(relatedType, relatedId) { setError(''); setMessage(''); try { const result = await adminEmploymentApi.triggerNotification({ relatedType, relatedId }, token); setMessage(`Station notification triggered. Created ${result.createdCount || 0} matched notifications.`) } catch (e) { setError(e.message) } }
  async function deleteFair(id) { setError(''); try { await adminEmploymentApi.deleteFair(id, token); await loadAll() } catch (e) { setError(e.message) } }
  async function deleteJob(id) { setError(''); try { await adminEmploymentApi.deleteJob(id, token); await loadAll() } catch (e) { setError(e.message) } }
  function editFair(fair) { setEditingFairId(fair.id); setFairForm({ ...emptyFair, ...fair, startTime: (fair.startTime || '').slice(0, 16), endTime: (fair.endTime || '').slice(0, 16), applyDeadline: (fair.applyDeadline || '').slice(0, 16) }) }
  function editJob(job) { setEditingJobId(job.id); setJobForm({ ...emptyJob, ...job }) }
  const updateFair = (key, value) => setFairForm(prev => ({ ...prev, [key]: value }))
  const updateJob = (key, value) => setJobForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="app"><Navbar /><main className="shell">
      <section className="section"><div className="section-head"><p className="eyebrow">Admin - Employment</p><h2>Career fair and job management</h2><p className="muted">Maintain employment source data and trigger matched station notifications.</p>{error && <div className="error-text">{error}</div>}{message && <div className="notice-box">{message}</div>}</div>
      <div className="grid-two"><div className="feature-card"><div className="card-title">{editingFairId ? 'Edit fair' : 'New fair'}</div><div className="form-grid"><label className="field"><span>Title</span><input value={fairForm.title} onChange={e => updateFair('title', e.target.value)} /></label><label className="field"><span>Company</span><input value={fairForm.companyName} onChange={e => updateFair('companyName', e.target.value)} /></label><label className="field"><span>City</span><input value={fairForm.city || ''} onChange={e => updateFair('city', e.target.value)} /></label><label className="field"><span>Industry</span><input value={fairForm.industry || ''} onChange={e => updateFair('industry', e.target.value)} /></label><label className="field"><span>Roles</span><input value={fairForm.targetRoles || ''} onChange={e => updateFair('targetRoles', e.target.value)} /></label><label className="field"><span>Location</span><input value={fairForm.location || ''} onChange={e => updateFair('location', e.target.value)} /></label><label className="field"><span>Start</span><input type="datetime-local" value={fairForm.startTime || ''} onChange={e => updateFair('startTime', e.target.value)} /></label><label className="field"><span>End</span><input type="datetime-local" value={fairForm.endTime || ''} onChange={e => updateFair('endTime', e.target.value)} /></label><label className="field"><span>Deadline</span><input type="datetime-local" value={fairForm.applyDeadline || ''} onChange={e => updateFair('applyDeadline', e.target.value)} /></label><label className="field"><span>Apply URL</span><input value={fairForm.applyUrl || ''} onChange={e => updateFair('applyUrl', e.target.value)} /></label><label className="field"><span>Description</span><textarea value={fairForm.description || ''} onChange={e => updateFair('description', e.target.value)} /></label></div><button className="btn primary" type="button" onClick={saveFair}>Save fair</button></div>
      <div className="feature-card"><div className="card-title">{editingJobId ? 'Edit job' : 'New job'}</div><div className="form-grid"><label className="field"><span>Title</span><input value={jobForm.title} onChange={e => updateJob('title', e.target.value)} /></label><label className="field"><span>Company</span><input value={jobForm.companyName} onChange={e => updateJob('companyName', e.target.value)} /></label><label className="field"><span>City</span><input value={jobForm.city || ''} onChange={e => updateJob('city', e.target.value)} /></label><label className="field"><span>Industry</span><input value={jobForm.industry || ''} onChange={e => updateJob('industry', e.target.value)} /></label><label className="field"><span>Role</span><input value={jobForm.roleType || ''} onChange={e => updateJob('roleType', e.target.value)} /></label><label className="field"><span>Salary</span><input value={jobForm.salaryRange || ''} onChange={e => updateJob('salaryRange', e.target.value)} /></label><label className="field"><span>Education</span><input value={jobForm.educationRequirement || ''} onChange={e => updateJob('educationRequirement', e.target.value)} /></label><label className="field"><span>Majors</span><input value={jobForm.majorKeywords || ''} onChange={e => updateJob('majorKeywords', e.target.value)} /></label><label className="field"><span>Skills</span><input value={jobForm.skillTags || ''} onChange={e => updateJob('skillTags', e.target.value)} /></label><label className="field"><span>Apply URL</span><input value={jobForm.applyUrl || ''} onChange={e => updateJob('applyUrl', e.target.value)} /></label><label className="field"><span>Description</span><textarea value={jobForm.description || ''} onChange={e => updateJob('description', e.target.value)} /></label></div><button className="btn primary" type="button" onClick={saveJob}>Save job</button></div></div></section>
      <section className="section"><div className="section-head"><h2>Managed data</h2></div>{loading && <div className="feature-card"><p className="muted">Loading employment data...</p></div>}<div className="grid-two"><div className="feature-card metrics"><div className="card-title">Career fairs</div>{fairs.length === 0 && !loading && <p className="muted">No fairs yet.</p>}{fairs.map(fair => <div className="room-row" key={fair.id}><div><div className="room-title">{fair.title}</div><div className="room-sub">{fair.companyName} - {fair.city}</div></div><button className="btn outline small" type="button" onClick={() => editFair(fair)}>Edit</button><button className="btn outline small" type="button" onClick={() => triggerNotification('FAIR', fair.id)}>Notify</button><button className="btn ghost small" type="button" onClick={() => deleteFair(fair.id)}>Delete</button></div>)}</div><div className="feature-card metrics"><div className="card-title">Job postings</div>{jobs.length === 0 && !loading && <p className="muted">No jobs yet.</p>}{jobs.map(job => <div className="room-row" key={job.id}><div><div className="room-title">{job.title}</div><div className="room-sub">{job.companyName} - {job.city} - {job.roleType}</div></div><button className="btn outline small" type="button" onClick={() => editJob(job)}>Edit</button><button className="btn outline small" type="button" onClick={() => triggerNotification('JOB', job.id)}>Notify</button><button className="btn ghost small" type="button" onClick={() => deleteJob(job.id)}>Delete</button></div>)}</div></div></section>
    </main><Footer /></div>
  )
}
