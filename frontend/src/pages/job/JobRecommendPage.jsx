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
      <div className="section-head"><p className="eyebrow">就业方向 - 规则推荐</p><h2>匹配岗位列表</h2><p className="muted">按城市、行业、岗位、专业和简历技能进行确定性匹配，不调用外部招聘服务。</p>{error && <div className="error-text">{error}</div>}</div>
      <div className="grid-two"><div className="feature-card"><div className="card-title">筛选条件</div><div className="form-grid"><label className="field"><span>城市</span><input value={filters.city} onChange={e => updateFilter('city', e.target.value)} placeholder="上海" /></label><label className="field"><span>行业</span><input value={filters.industry} onChange={e => updateFilter('industry', e.target.value)} placeholder="互联网" /></label><label className="field"><span>岗位</span><input value={filters.roleType} onChange={e => updateFilter('roleType', e.target.value)} placeholder="后端" /></label></div><button className="btn primary" type="button" onClick={() => refresh(filters)}>刷新推荐</button></div>
      <div className="feature-card metrics"><div className="card-title">站内提醒</div>{notifications.length === 0 && <p className="muted">暂无就业提醒。</p>}{notifications.slice(0, 4).map(item => <div className="room-row" key={item.id}><div><div className="room-title">{item.title}</div><div className="room-sub">{item.content}</div></div>{item.readFlag ? <span className="tag subtle">已读</span> : <button className="btn outline small" type="button" onClick={() => markRead(item.id)}>标记已读</button>}</div>)}</div></div>
      <div className="track-grid">{loading && <div className="track-card"><p className="muted">正在计算匹配结果...</p></div>}{!loading && recommendations.length === 0 && <div className="track-card"><p className="muted">暂无匹配岗位，请先保存偏好或完善简历。</p></div>}{recommendations.map(job => <div className="track-card" key={job.id}><div className="track-head"><h3>{job.title}</h3><span className="tag subtle">匹配分 {job.matchScore}</span></div><p className="muted">{job.companyName} - {job.city || '待定'} - {job.industry || '待定'} - {job.salaryRange || '面议'}</p><p>{job.description || '暂无描述。'}</p><div className="tag-row">{(job.matchReasons || []).map(reason => <span className="tag subtle" key={reason}>{reason}</span>)}</div>{job.applyUrl && <a className="btn primary small" href={job.applyUrl} target="_blank" rel="noreferrer">打开申请链接</a>}</div>)}</div>
      <Link className="btn ghost" to="/job">返回就业面板</Link>
    </section></main><Footer /></div>
  )
}
