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

  async function saveFair() { setError(''); setMessage(''); try { const payload = normalizeDateFields(fairForm, ['startTime', 'endTime', 'applyDeadline']); if (editingFairId) await adminEmploymentApi.updateFair(editingFairId, payload, token); else await adminEmploymentApi.createFair(payload, token); setFairForm(emptyFair); setEditingFairId(null); setMessage('招聘会已保存，用户端会按启用状态展示。'); await loadAll() } catch (e) { setError(e.message) } }
  async function saveJob() { setError(''); setMessage(''); try { if (editingJobId) await adminEmploymentApi.updateJob(editingJobId, jobForm, token); else await adminEmploymentApi.createJob(jobForm, token); setJobForm(emptyJob); setEditingJobId(null); setMessage('岗位已保存，用户端会按启用状态展示。'); await loadAll() } catch (e) { setError(e.message) } }
  async function triggerNotification(relatedType, relatedId) { setError(''); setMessage(''); try { const result = await adminEmploymentApi.triggerNotification({ relatedType, relatedId }, token); setMessage(`站内提醒已触发，生成 ${result.createdCount || 0} 条匹配提醒。`) } catch (e) { setError(e.message) } }
  async function deleteFair(id) { if (!window.confirm('确认删除该招聘会？如只是暂时下架，建议改为停用。')) return; setError(''); setMessage(''); try { await adminEmploymentApi.deleteFair(id, token); setMessage('招聘会已删除。'); await loadAll() } catch (e) { setError(e.message) } }
  async function deleteJob(id) { if (!window.confirm('确认删除该岗位？如已有投递记录，建议改为停用以保留历史关联。')) return; setError(''); setMessage(''); try { await adminEmploymentApi.deleteJob(id, token); setMessage('岗位已删除。'); await loadAll() } catch (e) { setError(e.message) } }
  function editFair(fair) { setEditingFairId(fair.id); setFairForm({ ...emptyFair, ...fair, startTime: (fair.startTime || '').slice(0, 16), endTime: (fair.endTime || '').slice(0, 16), applyDeadline: (fair.applyDeadline || '').slice(0, 16) }) }
  function editJob(job) { setEditingJobId(job.id); setJobForm({ ...emptyJob, ...job }) }
  const updateFair = (key, value) => setFairForm(prev => ({ ...prev, [key]: value }))
  const updateJob = (key, value) => setJobForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="app"><Navbar /><main className="shell">
      <section className="section"><div className="section-head"><p className="eyebrow">管理后台 - 就业模块</p><h2>招聘会与岗位管理</h2><p className="muted">维护就业数据源，按用户偏好触发站内提醒。</p>{error && <div className="error-text">{error}</div>}{message && <div className="notice-box">{message}</div>}</div>
      <div className="grid-two"><div className="feature-card"><div className="card-title">{editingFairId ? '编辑招聘会' : '新增招聘会'}</div><div className="form-grid"><label className="field"><span>标题</span><input value={fairForm.title} onChange={e => updateFair('title', e.target.value)} /></label><label className="field"><span>企业</span><input value={fairForm.companyName} onChange={e => updateFair('companyName', e.target.value)} /></label><label className="field"><span>城市</span><input value={fairForm.city || ''} onChange={e => updateFair('city', e.target.value)} /></label><label className="field"><span>行业</span><input value={fairForm.industry || ''} onChange={e => updateFair('industry', e.target.value)} /></label><label className="field"><span>目标岗位</span><input value={fairForm.targetRoles || ''} onChange={e => updateFair('targetRoles', e.target.value)} /></label><label className="field"><span>地点</span><input value={fairForm.location || ''} onChange={e => updateFair('location', e.target.value)} /></label><label className="field"><span>开始时间</span><input type="datetime-local" value={fairForm.startTime || ''} onChange={e => updateFair('startTime', e.target.value)} /></label><label className="field"><span>结束时间</span><input type="datetime-local" value={fairForm.endTime || ''} onChange={e => updateFair('endTime', e.target.value)} /></label><label className="field"><span>网申截止</span><input type="datetime-local" value={fairForm.applyDeadline || ''} onChange={e => updateFair('applyDeadline', e.target.value)} /></label><label className="field"><span>申请链接</span><input value={fairForm.applyUrl || ''} onChange={e => updateFair('applyUrl', e.target.value)} /></label><label className="field"><span>展示状态</span><select value={fairForm.active ? 'true' : 'false'} onChange={e => updateFair('active', e.target.value === 'true')}><option value="true">启用</option><option value="false">停用</option></select></label><label className="field"><span>说明</span><textarea value={fairForm.description || ''} onChange={e => updateFair('description', e.target.value)} /></label></div><button className="btn primary" type="button" onClick={saveFair}>保存招聘会</button></div>
      <div className="feature-card"><div className="card-title">{editingJobId ? '编辑岗位' : '新增岗位'}</div><div className="form-grid"><label className="field"><span>岗位名称</span><input value={jobForm.title} onChange={e => updateJob('title', e.target.value)} /></label><label className="field"><span>企业</span><input value={jobForm.companyName} onChange={e => updateJob('companyName', e.target.value)} /></label><label className="field"><span>城市</span><input value={jobForm.city || ''} onChange={e => updateJob('city', e.target.value)} /></label><label className="field"><span>行业</span><input value={jobForm.industry || ''} onChange={e => updateJob('industry', e.target.value)} /></label><label className="field"><span>岗位类型</span><input value={jobForm.roleType || ''} onChange={e => updateJob('roleType', e.target.value)} /></label><label className="field"><span>薪资</span><input value={jobForm.salaryRange || ''} onChange={e => updateJob('salaryRange', e.target.value)} /></label><label className="field"><span>学历要求</span><input value={jobForm.educationRequirement || ''} onChange={e => updateJob('educationRequirement', e.target.value)} /></label><label className="field"><span>专业关键词</span><input value={jobForm.majorKeywords || ''} onChange={e => updateJob('majorKeywords', e.target.value)} /></label><label className="field"><span>技能标签</span><input value={jobForm.skillTags || ''} onChange={e => updateJob('skillTags', e.target.value)} /></label><label className="field"><span>申请链接</span><input value={jobForm.applyUrl || ''} onChange={e => updateJob('applyUrl', e.target.value)} /></label><label className="field"><span>展示状态</span><select value={jobForm.active ? 'true' : 'false'} onChange={e => updateJob('active', e.target.value === 'true')}><option value="true">启用</option><option value="false">停用</option></select></label><label className="field"><span>岗位描述</span><textarea value={jobForm.description || ''} onChange={e => updateJob('description', e.target.value)} /></label></div><button className="btn primary" type="button" onClick={saveJob}>保存岗位</button></div></div></section>
      <section className="section"><div className="section-head"><h2>已维护数据</h2></div>{loading && <div className="feature-card"><p className="muted">正在加载就业数据...</p></div>}<div className="grid-two"><div className="feature-card metrics"><div className="card-title">招聘会</div>{fairs.length === 0 && !loading && <p className="muted">暂无招聘会。</p>}{fairs.map(fair => <div className="room-row" key={fair.id}><div><div className="room-title">{fair.title}</div><div className="room-sub">{fair.companyName} - {fair.city || '城市待定'} - {fair.active ? '启用' : '停用'}</div></div><button className="btn outline small" type="button" onClick={() => editFair(fair)}>编辑</button><button className="btn outline small" type="button" onClick={() => triggerNotification('FAIR', fair.id)}>提醒</button><button className="btn ghost small" type="button" onClick={() => deleteFair(fair.id)}>删除</button></div>)}</div><div className="feature-card metrics"><div className="card-title">岗位</div>{jobs.length === 0 && !loading && <p className="muted">暂无岗位。</p>}{jobs.map(job => <div className="room-row" key={job.id}><div><div className="room-title">{job.title}</div><div className="room-sub">{job.companyName} - {job.city || '城市待定'} - {job.roleType || '岗位类型待定'} - {job.active ? '启用' : '停用'}</div></div><button className="btn outline small" type="button" onClick={() => editJob(job)}>编辑</button><button className="btn outline small" type="button" onClick={() => triggerNotification('JOB', job.id)}>提醒</button><button className="btn ghost small" type="button" onClick={() => deleteJob(job.id)}>删除</button></div>)}</div></div></section>
    </main><Footer /></div>
  )
}
