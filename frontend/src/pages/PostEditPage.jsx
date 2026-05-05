import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarkdownContent from '../components/MarkdownContent.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { userApi } from '../lib/api.js'
import {
  postCategoryOptions,
  POST_CONTENT_MAX,
  POST_CONTENT_MIN,
  POST_TITLE_MAX,
  POST_TITLE_MIN,
} from '../constants/postEditor.js'
import '../App.css'

const statusLabelMap = {
  DRAFT: '草稿',
  PENDING: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '已驳回',
  OFFLINE: '已下架',
}

const visibilityLabelMap = {
  public: '公开可见',
  members: '仅注册用户可见',
}

function buildPostForm(post = {}) {
  return {
    title: post.title || '',
    content: post.content || '',
    categoryCode: post.categoryCode || 'kaoyan',
    tags: post.tags || '',
    visibility: post.visibility || 'public',
    anonymous: Boolean(post.anonymous),
  }
}

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 16) : '暂无记录'
}

function getCategoryName(code) {
  return postCategoryOptions.find((item) => item.code === code)?.name || '未分类'
}

function parseTagList(tags) {
  return String(tags || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildMetaDraft(form = {}) {
  return {
    title: form.title || '',
    categoryCode: form.categoryCode || 'kaoyan',
    tags: form.tags || '',
    visibility: form.visibility || 'public',
    anonymous: Boolean(form.anonymous),
  }
}

export default function PostEditPage() {
  const { postId } = useParams()
  const { token, isAuthed } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [postMeta, setPostMeta] = useState(null)
  const [postForm, setPostForm] = useState(() => buildPostForm())
  const [metaModalOpen, setMetaModalOpen] = useState(false)
  const [metaDraft, setMetaDraft] = useState(() => buildMetaDraft())
  const [metaError, setMetaError] = useState('')
  const [previewEditMode, setPreviewEditMode] = useState(false)
  const previewEditorRef = useRef(null)

  const postContentLength = postForm.content.trim().length
  const postLineCount = postForm.content ? postForm.content.split('\n').length : 0
  const statusLabel = statusLabelMap[(postMeta?.status || '').toUpperCase()] || (postMeta?.status || '未知状态')
  const tagList = useMemo(() => parseTagList(postForm.tags), [postForm.tags])

  useEffect(() => {
    let active = true

    async function loadPost() {
      if (!token) return
      setLoading(true)
      setLoadError('')
      try {
        const data = await userApi.myPostDetail(postId, token)
        if (!active) return

        const nextForm = buildPostForm(data)
        setPostMeta(data)
        setPostForm(nextForm)
        setMetaDraft(buildMetaDraft(nextForm))
      } catch (error) {
        if (active) {
          setLoadError(error.message || '加载帖子失败')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPost()
    return () => {
      active = false
    }
  }, [postId, token])

  useEffect(() => {
    if (!metaModalOpen) return undefined

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        closeMetaModal()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [metaModalOpen])

  useEffect(() => {
    if (!previewEditMode) return
    previewEditorRef.current?.focus()
  }, [previewEditMode])

  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }

  function updateContent(value) {
    setActionError('')
    setSaveMessage('')
    setPostForm((current) => ({ ...current, content: value }))
  }

  function enterPreviewEditMode() {
    setPreviewEditMode(true)
  }

  function exitPreviewEditMode() {
    setPreviewEditMode(false)
  }

  function openMetaModal() {
    setMetaError('')
    setMetaDraft(buildMetaDraft(postForm))
    setMetaModalOpen(true)
  }

  function closeMetaModal() {
    setMetaModalOpen(false)
    setMetaError('')
  }

  function applyMetaChanges(event) {
    event.preventDefault()
    const nextTitle = metaDraft.title.trim()

    if (nextTitle.length < POST_TITLE_MIN || nextTitle.length > POST_TITLE_MAX) {
      setMetaError(`标题需在 ${POST_TITLE_MIN}-${POST_TITLE_MAX} 个字符之间`)
      return
    }

    setPostForm((current) => ({
      ...current,
      ...metaDraft,
      title: nextTitle,
      tags: metaDraft.tags.trim(),
    }))
    setPostMeta((current) => (current ? {
      ...current,
      title: nextTitle,
      categoryCode: metaDraft.categoryCode,
      category: getCategoryName(metaDraft.categoryCode),
      tags: metaDraft.tags.trim(),
      visibility: metaDraft.visibility,
      anonymous: metaDraft.anonymous,
    } : current))
    setSaveMessage('文章信息已更新到当前编辑页，记得点击“保存修改”提交。')
    closeMetaModal()
  }

  async function handleSave(event) {
    event.preventDefault()
    const title = postForm.title.trim()
    const content = postForm.content.trim()

    if (title.length < POST_TITLE_MIN || title.length > POST_TITLE_MAX) {
      setActionError(`标题需在 ${POST_TITLE_MIN}-${POST_TITLE_MAX} 个字符之间`)
      return
    }

    if (content.length < POST_CONTENT_MIN || content.length > POST_CONTENT_MAX) {
      setActionError(`Markdown 正文需在 ${POST_CONTENT_MIN}-${POST_CONTENT_MAX} 个字符之间`)
      return
    }

    setSaving(true)
    setActionError('')
    setSaveMessage('')

    try {
      const payload = {
        title,
        content,
        categoryCode: postForm.categoryCode,
        tags: postForm.tags.trim(),
        visibility: postForm.visibility,
        anonymous: postForm.anonymous,
      }

      const updated = await userApi.updateMyPost(postId, payload, token)
      setPostForm((current) => ({
        ...current,
        title,
        content,
        tags: payload.tags,
      }))
      setPostMeta((current) => ({
        ...current,
        ...updated,
        ...payload,
        category: updated.category || getCategoryName(payload.categoryCode),
      }))
      setSaveMessage('正文和文章信息都已保存。')
    } catch (error) {
      setActionError(error.message || '保存帖子失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="container post-editor-shell">
        <section className="post-editor-topbar">
          <div className="post-editor-topbar-main">
            <Link className="post-editor-back" to="/profile">← 返回个人中心</Link>
            <div className="post-editor-heading">
              <span className="eyebrow">Markdown 编辑</span>
              <h1>{postForm.title.trim() || '未命名帖子'}</h1>
              <p className="muted">正文在页面里专心编辑，标题、分类、标签和可见范围放进弹窗里维护。</p>
            </div>
          </div>
          <div className="post-editor-topbar-actions">
            <button className="btn ghost" type="button" onClick={openMetaModal} disabled={loading}>
              编辑文章信息
            </button>
            {postMeta?.status === 'PUBLISHED' ? (
              <Link className="btn outline" to={`/community/${postId}`}>查看帖子</Link>
            ) : null}
            <button
              className="btn primary"
              type="submit"
              form="post-editor-form"
              disabled={loading || saving}
            >
              {saving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </section>

        {loadError ? (
          <section className="feature-card">
            <div className="error-text">{loadError}</div>
            <div className="comment-actions">
              <Link className="btn ghost" to="/profile">返回个人中心</Link>
              <button className="btn outline" type="button" onClick={() => window.location.reload()}>
                重新加载
              </button>
            </div>
          </section>
        ) : null}

        {loading ? (
          <section className="feature-card">加载中...</section>
        ) : null}

        {!loading && !loadError ? (
          <>
            <section className="post-editor-status-strip">
              <span className="post-editor-chip">状态：{statusLabel}</span>
              <span className="post-editor-chip">分类：{getCategoryName(postForm.categoryCode)}</span>
              <span className="post-editor-chip">字数：{postContentLength}/{POST_CONTENT_MAX}</span>
              <span className="post-editor-chip">行数：{postLineCount}</span>
              <span className="post-editor-chip">更新：{formatDateTime(postMeta?.updatedAt)}</span>
            </section>

            <form id="post-editor-form" className="post-editor-grid" onSubmit={handleSave}>
              <section className="feature-card post-editor-preview-card">
                <div className="post-editor-section-head">
                  <div>
                    <span className="eyebrow">Preview</span>
                    <h2>实时预览</h2>
                    <p className="muted">这里更接近用户最终看到的帖子排版。</p>
                  </div>
                  <div className="post-editor-preview-actions">
                    <span className="tag subtle">{postMeta?.contentFormat || 'markdown'}</span>
                    <button
                      className="btn ghost small"
                      type="button"
                      onClick={previewEditMode ? exitPreviewEditMode : enterPreviewEditMode}
                    >
                      {previewEditMode ? '退出原位编辑' : '预览区编辑'}
                    </button>
                  </div>
                </div>

                <div
                  className={`post-editor-paper${previewEditMode ? ' is-editing' : ''}`}
                  onDoubleClick={previewEditMode ? undefined : enterPreviewEditMode}
                >
                  <div className="post-editor-paper-header">
                    <h2>{postForm.title.trim() || '未命名帖子'}</h2>
                    <div className="post-editor-paper-meta">
                      <span className="post-editor-meta-pill">{getCategoryName(postForm.categoryCode)}</span>
                      <span className="post-editor-meta-pill">{visibilityLabelMap[postForm.visibility] || '公开可见'}</span>
                      {postForm.anonymous ? <span className="post-editor-meta-pill">匿名发布</span> : null}
                      {tagList.map((tag) => (
                        <span className="post-editor-meta-pill" key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </div>

                  {previewEditMode ? (
                    <div className="post-editor-inline-edit">
                      <div className="post-editor-inline-edit-tip">
                        现在可以直接在预览纸张里编辑正文，按 <kbd>Esc</kbd> 或点右上按钮退出。
                      </div>
                      <textarea
                        ref={previewEditorRef}
                        className="post-editor-paper-editor"
                        value={postForm.content}
                        onChange={(event) => updateContent(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            event.preventDefault()
                            exitPreviewEditMode()
                          }
                        }}
                        placeholder="在这里直接编辑 Markdown 正文内容..."
                      ></textarea>
                    </div>
                  ) : postForm.content.trim() ? (
                    <MarkdownContent content={postForm.content} />
                  ) : (
                    <div className="post-editor-empty">
                      双击这张预览纸，或者点击上方“预览区编辑”，就能直接在这里改正文。
                    </div>
                  )}
                </div>
              </section>

              <section className="feature-card post-editor-write-card">
                <div className="post-editor-section-head">
                  <div>
                    <span className="eyebrow">Write</span>
                    <h2>文章内容</h2>
                    <p className="muted">你既可以在这里写，也可以双击左侧预览纸张进行原位编辑。</p>
                  </div>
                  <button className="btn ghost small" type="button" onClick={openMetaModal}>
                    文章信息
                  </button>
                </div>

                <div className="post-editor-document-header">
                  <h3>{postForm.title.trim() || '未命名帖子'}</h3>
                  <p>{postMeta?.sourceFileName || '在线 Markdown 编辑'}</p>
                </div>

                <label className="field post-editor-content-field">
                  <div className="post-editor-editor-toolbar">
                    <span>Markdown 正文</span>
                    <span className="field-tip">{postContentLength}/{POST_CONTENT_MAX}</span>
                  </div>
                  <textarea
                    className="post-editor-textarea"
                    value={postForm.content}
                    onChange={(event) => updateContent(event.target.value)}
                    placeholder="在这里继续完善你的 Markdown 正文内容..."
                    required
                  ></textarea>
                </label>

                {actionError ? <div className="error-text">{actionError}</div> : null}
                {saveMessage ? <div className="notice-box post-editor-success">{saveMessage}</div> : null}

                <div className="post-editor-footer">
                  <div className="post-editor-note">
                    支持表格、代码块、任务列表、图片等 Markdown 内容。
                  </div>
                  <div className="post-editor-actions">
                    <Link className="btn ghost" to="/profile">取消并返回</Link>
                    <button className="btn primary" type="submit" disabled={saving}>
                      {saving ? '保存中...' : '保存帖子'}
                    </button>
                  </div>
                </div>
              </section>
            </form>
          </>
        ) : null}

        {metaModalOpen ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card post-editor-meta-modal">
              <div className="modal-head">
                <div>
                  <div className="modal-title">编辑文章信息</div>
                  <div className="muted">这里维护标题、分类、标签和发布信息；正文仍然在页面主体里编辑。</div>
                </div>
                <button className="icon-btn" type="button" onClick={closeMetaModal}>x</button>
              </div>

              <form className="modal-body" onSubmit={applyMetaChanges}>
                <div className="post-editor-meta-summary">
                  <div>
                    <strong>{metaDraft.title.trim() || '未命名帖子'}</strong>
                    <p className="muted">{postMeta?.sourceFileName || '在线 Markdown 编辑'}</p>
                  </div>
                  <div className="post-editor-meta-tags">
                    <span className="post-editor-meta-pill">{statusLabel}</span>
                    <span className="post-editor-meta-pill">{visibilityLabelMap[metaDraft.visibility] || '公开可见'}</span>
                    {metaDraft.anonymous ? <span className="post-editor-meta-pill">匿名发布</span> : null}
                    <span className="post-editor-meta-pill">{getCategoryName(metaDraft.categoryCode)}</span>
                  </div>
                </div>

                <label className="field">
                  <span>标题</span>
                  <input
                    type="text"
                    value={metaDraft.title}
                    onChange={(event) => {
                      setMetaError('')
                      setMetaDraft((current) => ({ ...current, title: event.target.value }))
                    }}
                    required
                  />
                  <span className="field-tip">{metaDraft.title.trim().length}/{POST_TITLE_MAX}</span>
                </label>

                <div className="grid-two compact">
                  <label className="field">
                    <span>分类</span>
                    <select
                      value={metaDraft.categoryCode}
                      onChange={(event) => {
                        setMetaError('')
                        setMetaDraft((current) => ({ ...current, categoryCode: event.target.value }))
                      }}
                    >
                      {postCategoryOptions.map((item) => (
                        <option key={item.code} value={item.code}>{item.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>可见范围</span>
                    <select
                      value={metaDraft.visibility}
                      onChange={(event) => {
                        setMetaError('')
                        setMetaDraft((current) => ({ ...current, visibility: event.target.value }))
                      }}
                    >
                      <option value="public">公开可见</option>
                      <option value="members">仅注册用户可见</option>
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>标签</span>
                  <input
                    type="text"
                    value={metaDraft.tags}
                    placeholder="用英文逗号分隔，例如：复试,经验,资料"
                    onChange={(event) => {
                      setMetaError('')
                      setMetaDraft((current) => ({ ...current, tags: event.target.value }))
                    }}
                  />
                </label>

                <label className="switch-item">
                  <input
                    type="checkbox"
                    checked={metaDraft.anonymous}
                    onChange={(event) => {
                      setMetaError('')
                      setMetaDraft((current) => ({ ...current, anonymous: event.target.checked }))
                    }}
                  />
                  <span>匿名发布</span>
                </label>

                {metaError ? <div className="error-text">{metaError}</div> : null}

                <div className="modal-actions">
                  <button className="btn ghost" type="button" onClick={closeMetaModal}>取消</button>
                  <button className="btn primary" type="submit">应用到当前编辑页</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
