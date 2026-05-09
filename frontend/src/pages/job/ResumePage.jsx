import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { employmentApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const templates = ['通用校招简历', '技术岗位简历', '产品运营简历']
const emptyResume = { templateType: '通用校招简历', baseInfo: '', education: '', projects: '', internships: '', skills: '', selfEvaluation: '' }

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
      setMessage('在线简历已保存，可刷新页面验证持久化结果。')
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const updateField = (key, value) => setResume(prev => ({ ...prev, [key]: value }))

  return (
    <div className="app"><Navbar /><main className="shell"><section className="section">
      <div className="section-head"><p className="eyebrow">就业方向 - 简历</p><h2>在线简历</h2><p className="muted">维护一份可持久保存的在线简历，用于岗位推荐和投递进度管理。</p>{error && <div className="error-text">{error}</div>}{message && <div className="notice-box">{message}</div>}</div>
      {loading ? <div className="feature-card"><p className="muted">正在加载简历...</p></div> : <div className="grid-two">
        <div className="feature-card"><div className="card-title">简历模板</div>{templates.map(item => <label className="room-row" key={item}><div><div className="room-title">{item}</div><div className="room-sub">以结构化在线文本保存。</div></div><input type="radio" checked={resume.templateType === item} onChange={() => updateField('templateType', item)} /></label>)}<button className="btn primary" type="button" onClick={saveResume} disabled={saving}>{saving ? '保存中...' : '保存简历'}</button></div>
        <div className="feature-card metrics"><div className="card-title">简历内容</div><div className="form-grid">
          <label className="field"><span>基本信息</span><textarea value={resume.baseInfo || ''} onChange={e => updateField('baseInfo', e.target.value)} placeholder="姓名、联系方式、目标岗位" /></label>
          <label className="field"><span>教育经历</span><textarea value={resume.education || ''} onChange={e => updateField('education', e.target.value)} placeholder="学校、专业、核心课程" /></label>
          <label className="field"><span>项目经历</span><textarea value={resume.projects || ''} onChange={e => updateField('projects', e.target.value)} placeholder="项目背景、个人职责、成果产出" /></label>
          <label className="field"><span>实习经历</span><textarea value={resume.internships || ''} onChange={e => updateField('internships', e.target.value)} placeholder="公司、岗位、工作影响" /></label>
          <label className="field"><span>技能特长</span><textarea value={resume.skills || ''} onChange={e => updateField('skills', e.target.value)} placeholder="Java、Spring Boot、SQL" /></label>
          <label className="field"><span>自我评价</span><textarea value={resume.selfEvaluation || ''} onChange={e => updateField('selfEvaluation', e.target.value)} placeholder="个人优势与职业目标" /></label>
        </div></div>
      </div>}
      <Link className="btn ghost" to="/job">返回就业面板</Link>
    </section></main><Footer /></div>
  )
}
