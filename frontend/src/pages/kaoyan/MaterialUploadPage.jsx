import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const MATERIAL_TYPES = ['笔记', '真题', '课件', '模拟卷', '其他']
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021]
const MAX_FILES = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function MaterialUploadPage() {
  const navigate = useNavigate()
  const { token, isAuthed } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    school: '',
    major: '',
    subject: '',
    year: '',
    materialType: '',
  })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  if (!isAuthed) {
    return (
      <div className="app">
        <Navbar />
        <main className="shell">
          <section className="section">
            <div className="section-head">
              <p className="eyebrow">考研 · 资源共享</p>
              <h2>上传资料</h2>
            </div>
            <div className="notice-box" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>请先 <Link to="/login">登录</Link> 后使用此功能</p>
            </div>
            <Link className="btn ghost" to="/kaoyan/materials">返回资料列表</Link>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    if (files.length + selected.length > MAX_FILES) {
      setError(`最多上传${MAX_FILES}个文件`)
      return
    }
    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`文件 ${f.name} 超过10MB限制`)
        return
      }
    }
    setFiles(prev => [...prev, ...selected])
    setError('')
  }

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('请填写标题'); return }
    setUploading(true)
    setError('')
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('title', form.title.trim())
      if (form.description) formData.append('description', form.description.trim())
      if (form.school) formData.append('school', form.school.trim())
      if (form.major) formData.append('major', form.major.trim())
      if (form.subject) formData.append('subject', form.subject.trim())
      if (form.year) formData.append('year', form.year)
      if (form.materialType) formData.append('materialType', form.materialType)
      for (const f of files) formData.append('files', f)

      setProgress(30)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/kaoyan/materials`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 80) + 10)
        }
      }

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText)
            if (xhr.status < 200 || xhr.status >= 300 || !data.success) {
              reject(new Error(data.message || '上传失败'))
              return
            }
            resolve(data)
          } catch {
            reject(new Error('服务器响应异常'))
          }
        }
        xhr.onerror = () => reject(new Error('网络错误'))
        xhr.send(formData)
      })

      setProgress(100)
      alert('资料上传成功，等待管理员审核')
      navigate('/kaoyan/materials/my')
    } catch (e) {
      setError(e.message)
      setUploading(false)
    }
  }

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研 · 资源共享</p>
            <h2>上传资料</h2>
            <p className="muted">上传备考资料，分享给需要的同学。上传后需管理员审核方可公开。</p>
          </div>

          <form className="feature-card" onSubmit={handleSubmit}>
            <div className="field">
              <label>标题 <span className="required">*</span></label>
              <input
                type="text"
                placeholder="请输入资料标题，最多50字"
                value={form.title}
                onChange={e => updateForm('title', e.target.value.slice(0, 50))}
                maxLength={50}
                required
              />
              <span className="muted small">{form.title.length}/50</span>
            </div>

            <div className="field">
              <label>介绍</label>
              <textarea
                placeholder="请输入资料介绍，最多500字"
                value={form.description}
                onChange={e => updateForm('description', e.target.value.slice(0, 500))}
                maxLength={500}
                rows={3}
                style={{ resize: 'vertical' }}
              />
              <span className="muted small">{form.description.length}/500</span>
            </div>

            <div className="filter-grid">
              <label className="field">
                <span>院校</span>
                <input type="text" placeholder="如：北京大学" value={form.school} onChange={e => updateForm('school', e.target.value)} />
              </label>
              <label className="field">
                <span>专业</span>
                <input type="text" placeholder="如：计算机科学与技术" value={form.major} onChange={e => updateForm('major', e.target.value)} />
              </label>
              <label className="field">
                <span>科目</span>
                <input type="text" placeholder="如：政治、英语、数学" value={form.subject} onChange={e => updateForm('subject', e.target.value)} />
              </label>
              <label className="field">
                <span>年份</span>
                <select value={form.year} onChange={e => updateForm('year', e.target.value)}>
                  <option value="">选择年份</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label className="field">
                <span>资料类型</span>
                <select value={form.materialType} onChange={e => updateForm('materialType', e.target.value)}>
                  <option value="">选择类型</option>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>

            <div className="field">
              <label>附件（最多{MAX_FILES}个，单文件≤10MB）</label>
              <input type="file" multiple onChange={handleFileChange} className="file-input" id="file-input" />
              <label htmlFor="file-input" className="file-upload-label">点击选择文件或将文件拖拽到此处</label>
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((f, idx) => (
                    <div key={idx} className="file-item">
                      <span className="file-name">📎 {f.name}</span>
                      <span className="muted small">{formatFileSize(f.size)}</span>
                      <button type="button" className="btn-text danger small" onClick={() => removeFile(idx)}>移除</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="error-msg">{error}</div>}

            {uploading && (
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: progress + '%' }} />
                <span className="muted small">上传中... {progress}%</span>
              </div>
            )}

            <div className="question-actions">
              <button type="submit" className="btn primary" disabled={uploading || !form.title.trim()}>
                {uploading ? '上传中...' : '提交审核'}
              </button>
              <button type="button" className="btn ghost" onClick={() => navigate('/kaoyan/materials')}>取消</button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  )
}