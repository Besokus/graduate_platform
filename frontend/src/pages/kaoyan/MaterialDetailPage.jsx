import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { materialApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

export default function MaterialDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, isAuthed } = useAuth()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    materialApi.detail(id, token).then(data => {
      setMaterial(data)
    }).catch(e => {
      setError('加载失败: ' + e.message)
    }).finally(() => setLoading(false))
  }, [id, token])

  const handleDownload = async (attachmentId, fileName) => {
    if (!isAuthed) {
      navigate('/login')
      return
    }
    setDownloading(attachmentId)
    try {
      const url = materialApi.downloadUrl(id, attachmentId)
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('下载失败')
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href)

      setMaterial(prev => ({
        ...prev,
        downloadCount: (prev.downloadCount || 0) + 1,
        attachments: prev.attachments.map(a =>
          a.id === attachmentId ? { ...a, downloadCount: (a.downloadCount || 0) + 1 } : a
        )
      }))
    } catch (e) {
      alert(e.message)
    } finally {
      setDownloading(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const statusLabel = (s) => ({ PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝' }[s] || s)
  const statusClass = (s) => ({ PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' }[s] || '')

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext)) return '📄'
    if (['doc', 'docx'].includes(ext)) return '📝'
    if (['xls', 'xlsx'].includes(ext)) return '📊'
    if (['ppt', 'pptx'].includes(ext)) return '📽'
    if (['zip', 'rar', '7z'].includes(ext)) return '📦'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼'
    if (['mp4', 'avi', 'mov'].includes(ext)) return '🎬'
    if (['mp3', 'wav', 'm4a'].includes(ext)) return '🎵'
    return '📎'
  }

  if (loading) return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="notice-box" style={{ textAlign: 'center', padding: '3rem' }}>加载中...</div>
        </section>
      </main>
      <Footer />
    </div>
  )
  if (error) return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="error-text">{error}</div>
          <Link className="btn ghost" to="/kaoyan/materials">返回资料列表</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
  if (!material) return null

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        {/* Header */}
        <section className="section">
          <div className="md-header">
            <div>
              <p className="eyebrow">考研 · 资源共享</p>
              <h2>{material.title}</h2>
              <div className="md-meta">
                <span className={`material-status status-${statusClass(material.status)}`}>{statusLabel(material.status)}</span>
                {material.school && <span className="tag subtle">📍 {material.school}</span>}
                {material.major && <span className="tag subtle">📚 {material.major}</span>}
                {material.subject && <span className="tag subtle">📖 {material.subject}</span>}
                {material.year && <span className="tag subtle">📅 {material.year}</span>}
                {material.materialType && <span className="tag subtle">{material.materialType}</span>}
              </div>
              <div className="md-meta">
                <span className="muted small">上传者ID: {material.uploaderId}</span>
                <span className="muted small">{material.createdAt?.replace('T', ' ').slice(0, 16)}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="feature-card" style={{ padding: '16px 22px' }}>
            <div className="metric-row" style={{ justifyContent: 'flex-start', gap: '2rem' }}>
              <span>👁 {material.viewCount || 0} 浏览</span>
              <span>⬇ {material.downloadCount || 0} 下载</span>
              <span>📎 {material.attachments?.length || 0} 个附件</span>
            </div>
          </div>

          {/* Description */}
          {material.description && (
            <div className="feature-card">
              <div className="card-title">资料介绍</div>
              <p className="muted" style={{ lineHeight: '1.8', margin: 0 }}>{material.description}</p>
            </div>
          )}

          {/* Attachments */}
          <div className="feature-card">
            <div className="card-title">附件列表</div>
            {material.attachments?.length === 0 ? (
              <div className="notice-box"><p>暂无附件</p></div>
            ) : (
              <div className="file-grid">
                {material.attachments.map(att => (
                  <div key={att.id} className="file-card">
                    <div className="file-card-icon">{getFileIcon(att.originalName)}</div>
                    <div className="file-card-info">
                      <span className="file-card-name" title={att.originalName}>{att.originalName}</span>
                      <div className="file-card-meta">
                        <span className="muted small">{formatFileSize(att.fileSize)}</span>
                        <span className="muted small">⬇ {att.downloadCount || 0}</span>
                      </div>
                    </div>
                    <button
                      className="btn primary small"
                      onClick={() => handleDownload(att.id, att.originalName)}
                      disabled={downloading === att.id}
                    >
                      {downloading === att.id ? '下载中...' : '下载'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isAuthed && (
              <div style={{ marginTop: '1.25rem', textAlign: 'center', padding: '1rem', background: 'rgba(26,158,122,0.06)', borderRadius: '14px' }}>
                <p className="muted">登录后可下载附件</p>
                <Link to="/login" className="btn primary small" style={{ marginTop: '0.5rem' }}>登录</Link>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Link className="btn ghost" to="/kaoyan/materials">返回资料列表</Link>
            <button className="btn outline" onClick={() => navigate('/kaoyan/materials/my')}>我的资料</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}