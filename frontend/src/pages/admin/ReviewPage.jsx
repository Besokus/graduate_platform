import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { adminApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const statusLabelMap = {
  PENDING: '待审核', PUBLISHED: '已发布', REJECTED: '驳回', OFFLINE: '已下架', DRAFT: '草稿',
}
const statusColors = {
  PENDING: '#d97706', PUBLISHED: '#0f766e', REJECTED: '#b91c1c', OFFLINE: '#6b7280', DRAFT: '#9ca3af',
}

export default function ReviewPage() {
  const { user, token, isAuthed } = useAuth()
  const [posts, setPosts] = useState([])
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acting, setActing] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = filterStatus
        ? await adminApi.reviewList(filterStatus, 0, 50, token)
        : await adminApi.reviewList('', 0, 50, token)
      setPosts(data.content || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterStatus, token])

  async function handleAction(postId, action) {
    setActing(postId)
    try {
      await adminApi.reviewPost(postId, action, '', token)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (e) {
      setError(e.message)
    } finally {
      setActing(null)
    }
  }

  if (!isAuthed || user?.role !== 'admin') return <Navigate to="/login" replace />

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">管理后台</p>
            <h2>内容审核</h2>
            <p className="muted">审核帖子：通过（变为已发布）、驳回、下架。操作即时生效。</p>
            {error && <div className="error-text">{error}</div>}
          </div>

          <div className="feature-card">
            <div className="card-title">筛选</div>
            <div className="tag-row">
              {['PENDING', 'PUBLISHED', 'REJECTED', 'OFFLINE'].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`tag tag-btn ${filterStatus === s ? 'selected' : ''}`}
                  onClick={() => setFilterStatus(s)}
                  style={filterStatus === s ? { background: statusColors[s] } : undefined}
                >
                  {statusLabelMap[s]} ({s})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="feature-card">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="feature-card">
              <div className="card-title">暂无 {statusLabelMap[filterStatus] || ''} 帖子</div>
            </div>
          ) : (
            <div className="track-grid">
              {posts.map(post => (
                <article className="track-card" key={post.id}>
                  <div className="track-head">
                    <h3>{post.title}</h3>
                    <span className="tag subtle" style={{ background: statusColors[post.status] + '18', color: statusColors[post.status] }}>
                      {statusLabelMap[post.status]}
                    </span>
                  </div>
                  <p className="muted">{post.content?.slice(0, 120)}...</p>
                  <div className="tag-row">
                    <span className="tag subtle">{post.category?.name}</span>
                    <span className="tag subtle">作者: {post.authorName || post.authorId}</span>
                    {post.tags?.split(',').filter(Boolean).map(t => (
                      <span className="tag subtle" key={t}>#{t.trim()}</span>
                    ))}
                  </div>
                  <div className="metric-row">
                    <span>浏览{post.viewCount}</span>
                    <span>评论{post.commentCount}</span>
                    <span>举报{post.reportCount}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {post.createdAt?.replace('T', ' ').slice(0, 16)}
                  </div>

                  {post.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn primary small"
                        disabled={acting === post.id}
                        onClick={() => handleAction(post.id, 'APPROVE')}
                      >
                        通过
                      </button>
                      <button
                        className="btn outline small"
                        disabled={acting === post.id}
                        onClick={() => handleAction(post.id, 'REJECT')}
                        style={{ color: '#b91c1c', borderColor: '#b91c1c' }}
                      >
                        驳回
                      </button>
                    </div>
                  )}
                  {post.status === 'PUBLISHED' && (
                    <button
                      className="btn outline small"
                      disabled={acting === post.id}
                      onClick={() => handleAction(post.id, 'OFFLINE')}
                      style={{ color: '#6b7280', borderColor: '#6b7280' }}
                    >
                      下架
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}

          <Link className="btn ghost" to="/admin">返回控制台</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
