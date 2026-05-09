import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { employmentApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const templates = ['General campus resume', 'Technical role resume', 'Product operations resume']
const emptyResume = { templateType: 'General campus resume', baseInfo: '', education: '', projects: '', internships: '', skills: '', selfEvaluation: '' }

export default function ResumePage() {
  const { token, isAuthed, loading: authLoading } = useAuth()
  const [resume, setResume] = useState(emptyResume)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthed) return
    employmentApi.resume(token).then(data => setResume({ ...emptyResume, ...data })).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [isAuthed, token])

  if (!authLoading && !isAuthed) return <Navigate to="/login" replace />

  async function saveResume() {
    setSaving(true); setError(''); setMessage('')
    try {
      const saved = await employmentApi.saveResume(resume, token)
      setResume({ ...emptyResume, ...saved })
      setMessage('Online resume saved. Refresh the page to verify persistence.')
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const updateField = (key, value) => setResume(prev => ({ ...prev, [key]: value }))

  return (
    <div className="app"><Navbar /><main className="shell"><section className="section">
      <div className="section-head"><p className="eyebrow">Employment - Resume</p><h2>Online resume</h2><p className="muted">Maintain one persisted online resume for recommendations and application tracking.</p>{error && <div className="error-text">{error}</div>}{message && <div className="notice-box">{message}</div>}</div>
      {loading ? <div className="feature-card"><p className="muted">Loading resume...</p></div> : <div className="grid-two">
        <div className="feature-card"><div className="card-title">Template</div>{templates.map(item => <label className="room-row" key={item}><div><div className="room-title">{item}</div><div className="room-sub">Saved as structured online text.</div></div><input type="radio" checked={resume.templateType === item} onChange={() => updateField('templateType', item)} /></label>)}<button className="btn primary" type="button" onClick={saveResume} disabled={saving}>{saving ? 'Saving...' : 'Save resume'}</button></div>
        <div className="feature-card metrics"><div className="card-title">Resume fields</div><div className="form-grid">
          <label className="field"><span>Base info</span><textarea value={resume.baseInfo || ''} onChange={e => updateField('baseInfo', e.target.value)} placeholder="Name, contact, target role" /></label>
          <label className="field"><span>Education</span><textarea value={resume.education || ''} onChange={e => updateField('education', e.target.value)} placeholder="School, major, courses" /></label>
          <label className="field"><span>Projects</span><textarea value={resume.projects || ''} onChange={e => updateField('projects', e.target.value)} placeholder="Project background, role, outcomes" /></label>
          <label className="field"><span>Internships</span><textarea value={resume.internships || ''} onChange={e => updateField('internships', e.target.value)} placeholder="Company, role, impact" /></label>
          <label className="field"><span>Skills</span><textarea value={resume.skills || ''} onChange={e => updateField('skills', e.target.value)} placeholder="Java, Spring Boot, SQL" /></label>
          <label className="field"><span>Self evaluation</span><textarea value={resume.selfEvaluation || ''} onChange={e => updateField('selfEvaluation', e.target.value)} placeholder="Strengths and career goal" /></label>
        </div></div>
      </div>}
      <Link className="btn ghost" to="/job">Back to employment panel</Link>
    </section></main><Footer /></div>
  )
}
