import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { employmentApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const emptyPreference = { cities: '', industries: '', roleTypes: '', salaryRange: '', companyTypes: '', active: true }
const emptyFilters = { city: '', industry: '', keyword: '' }

export default function CareerFairPage() {
  const { token, isAuthed } = useAuth()
  const [filters, setFilters] = useState(emptyFilters)
  const [preference, setPreference] = useState(emptyPreference)
  const [fairs, setFairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadFairs = useCallback(async (nextFilters = emptyFilters) => {
    setLoading(true)
    setError('')
    try {
      setFairs(await employmentApi.fairs(nextFilters))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFairs() }, [loadFairs])
  useEffect(() => {
    if (!isAuthed) return
    employmentApi.preference(token).then(data => setPreference({ ...emptyPreference, ...data })).catch(e => setError(e.message))
  }, [isAuthed, token])

  async function savePreference() {
    if (!isAuthed) { setError('Please log in before saving preferences.'); return }
    setSaving(true); setMessage(''); setError('')
    try {
      const saved = await employmentApi.savePreference(preference, token)
      setPreference({ ...emptyPreference, ...saved })
      setMessage('Preferences saved. Station notifications will use these matching rules.')
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const updatePreference = (key, value) => setPreference(prev => ({ ...prev, [key]: value }))
  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))

  return (
    <div className="app"><Navbar /><main className="shell"><section className="section">
      <div className="section-head">
        <p className="eyebrow">Employment - Career fairs</p>
        <h2>Career fairs and online application links</h2>
        <p className="muted">Browse campus events, application links, deadlines, and save station-notification preferences.</p>
        {error && <div className="error-text">{error}</div>}{message && <div className="notice-box">{message}</div>}
      </div>
      <div className="grid-two">
        <div className="feature-card"><div className="card-title">Preference settings</div><div className="form-grid">
          <label className="field"><span>Cities</span><input value={preference.cities || ''} onChange={e => updatePreference('cities', e.target.value)} placeholder="Shanghai,Suzhou" /></label>
          <label className="field"><span>Industries</span><input value={preference.industries || ''} onChange={e => updatePreference('industries', e.target.value)} placeholder="Internet,Manufacturing" /></label>
          <label className="field"><span>Roles</span><input value={preference.roleTypes || ''} onChange={e => updatePreference('roleTypes', e.target.value)} placeholder="Backend,Product" /></label>
          <label className="field"><span>Salary</span><input value={preference.salaryRange || ''} onChange={e => updatePreference('salaryRange', e.target.value)} placeholder="10k-20k" /></label>
          <label className="field"><span>Company types</span><input value={preference.companyTypes || ''} onChange={e => updatePreference('companyTypes', e.target.value)} placeholder="State-owned,Private" /></label>
        </div><button className="btn primary" type="button" onClick={savePreference} disabled={saving}>{saving ? 'Saving...' : 'Save preferences'}</button></div>
        <div className="feature-card metrics"><div className="card-title">Fair filters</div><div className="form-grid">
          <label className="field"><span>City</span><input value={filters.city} onChange={e => updateFilter('city', e.target.value)} placeholder="Shanghai" /></label>
          <label className="field"><span>Industry</span><input value={filters.industry} onChange={e => updateFilter('industry', e.target.value)} placeholder="Internet" /></label>
          <label className="field"><span>Keyword</span><input value={filters.keyword} onChange={e => updateFilter('keyword', e.target.value)} placeholder="Company or role" /></label>
        </div><button className="btn outline" type="button" onClick={() => loadFairs(filters)}>Search fairs</button></div>
      </div>
      <div className="track-grid">
        {loading && <div className="track-card"><p className="muted">Loading fairs...</p></div>}
        {!loading && fairs.length === 0 && <div className="track-card"><p className="muted">No matching fairs yet.</p></div>}
        {fairs.map(fair => <div className="track-card" key={fair.id}><div className="track-head"><h3>{fair.title}</h3><span className="tag subtle">{fair.city || 'TBD'}</span></div><p className="muted">{fair.companyName} - {fair.industry || 'Industry TBD'} - {fair.location || 'Location TBD'}</p><p>{fair.description || 'No description yet.'}</p><p className="room-sub">Start: {fair.startTime || 'TBD'}; deadline: {fair.applyDeadline || 'TBD'}</p>{fair.applyUrl && <a className="btn primary small" href={fair.applyUrl} target="_blank" rel="noreferrer">Open application link</a>}</div>)}
      </div>
      <Link className="btn ghost" to="/job">Back to employment panel</Link>
    </section></main><Footer /></div>
  )
}
