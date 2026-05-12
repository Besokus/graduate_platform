import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarkdownContent from '../components/MarkdownContent.jsx'
import { communityApi } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../App.css'

const statusLabelMap = {
  DRAFT: '草稿',
  PENDING: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '驳回',
  OFFLINE: '已下架',
}

function parseTags(post) {
  if (Array.isArray(post?.tags)) return post.tags
  if (typeof post?.tags === 'string') {
    return post.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export default function CommunityDetailPage() {
  const { id } = useParams()
  const { user, token, isAuthed } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [acting, setActing] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [postData, commentData] = await Promise.all([
          communityApi.postDetail(id, token),
          communityApi.comments(id, token),
        ])

        if (!active) return

        setPost({
          ...postData,
          tags: parseTags(postData),
          status: (postData.auditStatus || postData.status || 'PUBLISHED').toUpperCase(),
          contentFormat: postData.contentFormat || 'plain',
          sourceFileName: postData.sourceFileName || '',
          viewCount: postData.viewCount ?? postData.views ?? 0,
          commentCount: postData.commentCount ?? (commentData || []).length,
          likeCount: postData.likeCount ?? 0,
          favoriteCount: postData.favoriteCount ?? 0,
          reportCount: postData.reportCount ?? 0,
          liked: Boolean(postData.liked),
          favorited: Boolean(postData.favorited),
        })
        setComments(commentData || [])
      } catch (requestError) {
        if (active) {
          setError(requestError.message || '加载帖子失败')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id, token])

  async function handleSubmitComment(event) {
    event.preventDefault()
    if (!isAuthed || !user) {
      setCommentError('请先登录后评论')
      return
    }
    if (!commentText.trim()) {
      setCommentError('评论内容不能为空')
      return
    }
    if (commentText.trim().length > 300) {
      setCommentError('评论内容不能超过 300 字')
      return
    }

    setSubmitting(true)
    setCommentError('')
    try {
      const created = await communityApi.createComment(id, { content: commentText.trim() }, token)
      setComments((prev) => [...prev, created])
      setCommentText('')
      setPost((prev) => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev)
    } catch (requestError) {
      setCommentError(requestError.message || '评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleLike() {
    if (!isAuthed) {
      setActionMessage('请先登录后再点赞')
      return
    }

    setActing(true)
    setActionMessage('')
    try {
      const data = await communityApi.toggleLike(id, token)
      setPost((prev) => prev ? { ...prev, liked: data.liked, likeCount: data.likeCount } : prev)
    } catch (requestError) {
      setActionMessage(requestError.message || '点赞操作失败')
    } finally {
      setActing(false)
    }
  }

  async function handleToggleFavorite() {
    if (!isAuthed) {
      setActionMessage('请先登录后再收藏')
      return
    }

    setActing(true)
    setActionMessage('')
    try {
      const data = await communityApi.toggleFavorite(id, token)
      setPost((prev) => prev ? { ...prev, favorited: data.favorited, favoriteCount: data.favoriteCount } : prev)
    } catch (requestError) {
      setActionMessage(requestError.message || '收藏操作失败')
    } finally {
      setActing(false)
    }
  }

  async function handleReport() {
    if (!isAuthed) {
      setActionMessage('请先登录后再举报')
      return
    }

    const reason = window.prompt('请输入举报原因（不超过 300 字）')
    if (reason == null) return
    if (!reason.trim()) {
      setActionMessage('举报原因不能为空')
      return
    }

    setActing(true)
    setActionMessage('')
    try {
      const data = await communityApi.reportPost(id, reason.trim(), token)
      setPost((prev) => prev ? { ...prev, reportCount: data.reportCount } : prev)
      setActionMessage('举报已提交，等待管理员处理')
    } catch (requestError) {
      setActionMessage(requestError.message || '举报失败')
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          {loading ? (
            <div className="feature-card">加载中...</div>
          ) : error ? (
            <div className="error-text">{error}</div>
          ) : (
            <>
              <div className="detail-header">
                <div>
                  <p className="eyebrow">帖子详情</p>
                  <h2>{post?.title}</h2>
                  <div className="detail-meta">
                    <span className="tag subtle">{post?.category?.name || '社区'}</span>
                    <span className="tag subtle">{statusLabelMap[post?.status] || '已发布'}</span>
                    <span className="tag subtle">
                      {post?.visibility === 'members' ? '仅注册用户可见' : '公开可见'}
                    </span>
                    {post?.contentFormat === 'markdown' ? <span className="tag subtle">Markdown</span> : null}
                    {post?.anonymous ? <span className="tag subtle">匿名发布</span> : null}
                    {post?.hasAttachment ? <span className="tag subtle">含附加资料</span> : null}
                  </div>
                  <div className="detail-meta">
                    <span>{post?.sourceFileName || (post?.anonymous ? '匿名用户' : `作者ID: ${post?.authorId}`)}</span>
                    <span>{post?.createdAt?.replace('T', ' ').slice(0, 16)}</span>
                  </div>
                </div>
              </div>

              <div className="feature-card">
                {post?.tags?.length ? (
                  <div className="tag-row">
                    {post.tags.map((tag) => (
                      <span className="tag subtle" key={tag}>#{tag}</span>
                    ))}
                  </div>
                ) : null}

                <MarkdownContent content={post?.content || ''} />

                {post?.attachmentNote ? <div className="notice-box">{post.attachmentNote}</div> : null}

                <div className="metric-row">
                  <span>浏览 {post?.viewCount ?? 0}</span>
                  <span>评论 {post?.commentCount ?? 0}</span>
                  <span>点赞 {post?.likeCount ?? 0}</span>
                  <span>收藏 {post?.favoriteCount ?? 0}</span>
                  <span>举报 {post?.reportCount ?? 0}</span>
                </div>

                <div className="comment-actions">
                  <button
                    className={`btn outline small ${post?.liked ? 'selected' : ''}`}
                    type="button"
                    onClick={handleToggleLike}
                    disabled={acting}
                  >
                    {post?.liked ? '取消点赞' : '点赞'}
                  </button>
                  <button
                    className={`btn outline small ${post?.favorited ? 'selected' : ''}`}
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={acting}
                  >
                    {post?.favorited ? '取消收藏' : '收藏'}
                  </button>
                  <button
                    className="btn outline small"
                    type="button"
                    onClick={handleReport}
                    disabled={acting}
                    style={{ color: '#b91c1c', borderColor: '#b91c1c' }}
                  >
                    举报
                  </button>
                </div>
                {actionMessage ? <div className="muted">{actionMessage}</div> : null}
              </div>
            </>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <p className="eyebrow">评论区</p>
            <h2>讨论交流</h2>
            <p className="muted">游客可浏览评论，登录后可发表评论与互动。</p>
          </div>

          <div className="feature-card soft">
            <div className="comment-list">
              {comments.length ? (
                comments.map((item) => (
                  <div className="comment" key={item.id}>
                    <div className="comment-head">
                      <span className="comment-author">用户 {item.authorId}</span>
                      <span className="comment-time">
                        {item.createdAt?.replace('T', ' ').slice(0, 16)}
                      </span>
                    </div>
                    <div className="comment-body">{item.content}</div>
                  </div>
                ))
              ) : (
                <div className="muted">还没有评论，来发布第一条吧。</div>
              )}
            </div>

            <form className="comment-box" onSubmit={handleSubmitComment}>
              <textarea
                rows="4"
                placeholder={isAuthed ? '写下你的评论...' : '请先登录后评论'}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                disabled={!isAuthed}
              ></textarea>
              <div className="muted">评论字数：{commentText.trim().length}/300</div>
              {commentError ? <div className="error-text">{commentError}</div> : null}
              <div className="comment-actions">
                {!isAuthed ? <Link className="btn ghost" to="/login">去登录</Link> : null}
                <button
                  className="btn primary small"
                  type="submit"
                  disabled={!commentText.trim() || submitting || !isAuthed}
                >
                  {submitting ? '发送中...' : '发送评论'}
                </button>
              </div>
            </form>
          </div>

          <Link className="btn ghost" to="/community">返回社区</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
