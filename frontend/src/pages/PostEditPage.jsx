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

function normalizeMarkdown(value) {
  return String(value || '').replace(/\r\n/g, '\n')
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isTableSeparator(line, columnCount) {
  const cells = splitTableRow(line)
  return cells.length === columnCount && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function isHeading(line) {
  return /^#{1,6}\s+/.test(line)
}

function isRule(line) {
  return /^(-{3,}|\*{3,}|_{3,})$/.test(line)
}

function isUnorderedList(line) {
  return /^[-*+]\s+/.test(line)
}

function isOrderedList(line) {
  return /^\d+\.\s+/.test(line)
}

function isTableStart(lines, index) {
  if (index + 1 >= lines.length) return false
  const headerCells = splitTableRow(lines[index])
  if (headerCells.length <= 1) return false
  return isTableSeparator(lines[index + 1], headerCells.length)
}

function parseMarkdownBlocks(content) {
  const markdown = normalizeMarkdown(content)
  if (!markdown) return []

  const lines = markdown.split('\n')
  const lineOffsets = []
  let offset = 0

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    lineOffsets.push(offset)
    offset += lines[lineIndex].length
    if (lineIndex < lines.length - 1) {
      offset += 1
    }
  }

  const blocks = []
  let index = 0
  let blockId = 0

  function pushBlock(startLine, endLine) {
    const startOffset = lineOffsets[startLine]
    const endOffset = lineOffsets[endLine] + lines[endLine].length
    blocks.push({
      id: blockId,
      startLine,
      endLine,
      startOffset,
      endOffset,
      text: markdown.slice(startOffset, endOffset),
    })
    blockId += 1
  }

  while (index < lines.length) {
    const trimmed = lines[index].trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const startLine = index
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        index += 1
      }
      if (index < lines.length) {
        index += 1
      }
      pushBlock(startLine, Math.max(startLine, index - 1))
      continue
    }

    if (isHeading(trimmed) || isRule(trimmed)) {
      pushBlock(index, index)
      index += 1
      continue
    }

    if (isTableStart(lines, index)) {
      const startLine = index
      const headerCells = splitTableRow(lines[index])
      index += 2

      while (index < lines.length) {
        const rowTrimmed = lines[index].trim()
        if (!rowTrimmed) break

        const rowCells = splitTableRow(lines[index])
        if (rowCells.length !== headerCells.length) break
        index += 1
      }

      pushBlock(startLine, Math.max(startLine, index - 1))
      continue
    }

    if (trimmed.startsWith('>')) {
      const startLine = index
      index += 1
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        index += 1
      }
      pushBlock(startLine, Math.max(startLine, index - 1))
      continue
    }

    if (isUnorderedList(trimmed)) {
      const startLine = index
      index += 1
      while (index < lines.length && isUnorderedList(lines[index].trim())) {
        index += 1
      }
      pushBlock(startLine, Math.max(startLine, index - 1))
      continue
    }

    if (isOrderedList(trimmed)) {
      const startLine = index
      index += 1
      while (index < lines.length && isOrderedList(lines[index].trim())) {
        index += 1
      }
      pushBlock(startLine, Math.max(startLine, index - 1))
      continue
    }

    const startLine = index
    index += 1
    while (index < lines.length) {
      const nextTrimmed = lines[index].trim()
      if (!nextTrimmed) break
      if (
        nextTrimmed.startsWith('```') ||
        isHeading(nextTrimmed) ||
        nextTrimmed.startsWith('>') ||
        isUnorderedList(nextTrimmed) ||
        isOrderedList(nextTrimmed) ||
        isRule(nextTrimmed) ||
        isTableStart(lines, index)
      ) {
        break
      }
      index += 1
    }
    pushBlock(startLine, Math.max(startLine, index - 1))
  }

  return blocks
}

function replaceRange(text, startOffset, endOffset, replacement) {
  const normalized = normalizeMarkdown(text)
  const nextReplacement = normalizeMarkdown(replacement)
  return normalized.slice(0, startOffset) + nextReplacement + normalized.slice(endOffset)
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

  const [renderEditMode, setRenderEditMode] = useState(false)
  const [activeBlockId, setActiveBlockId] = useState(null)
  const [activeBlockDraft, setActiveBlockDraft] = useState('')

  const sourceScrollRef = useRef(null)
  const previewScrollRef = useRef(null)
  const blockEditorRef = useRef(null)
  const syncingSourceRef = useRef(false)
  const syncingPreviewRef = useRef(false)

  const postContentLength = postForm.content.trim().length
  const postLineCount = postForm.content ? postForm.content.split('\n').length : 0
  const statusLabel =
    statusLabelMap[(postMeta?.status || '').toUpperCase()] || (postMeta?.status || '未知状态')
  const tagList = useMemo(() => parseTagList(postForm.tags), [postForm.tags])
  const markdownBlocks = useMemo(() => parseMarkdownBlocks(postForm.content), [postForm.content])
  const activeBlock = useMemo(
    () => markdownBlocks.find((block) => block.id === activeBlockId) || null,
    [activeBlockId, markdownBlocks],
  )

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
    if (!renderEditMode) return undefined

    function handleKeydown(event) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (activeBlockId !== null) {
        setActiveBlockId(null)
        setActiveBlockDraft('')
      } else {
        setRenderEditMode(false)
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [activeBlockId, renderEditMode])

  useEffect(() => {
    if (!renderEditMode) {
      setActiveBlockId(null)
      setActiveBlockDraft('')
    }
  }, [renderEditMode])

  useEffect(() => {
    if (!renderEditMode || activeBlockId === null) return
    if (!activeBlock) {
      setActiveBlockId(null)
      setActiveBlockDraft('')
      return
    }
    blockEditorRef.current?.focus()
  }, [activeBlock, activeBlockId, renderEditMode])

  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }

  function updateContent(value) {
    setActionError('')
    setSaveMessage('')
    setPostForm((current) => ({ ...current, content: value }))
  }

  function syncScroll(fromElement, toElement, lockRef) {
    if (!fromElement || !toElement) return

    const fromScrollable = fromElement.scrollHeight - fromElement.clientHeight
    const toScrollable = toElement.scrollHeight - toElement.clientHeight
    if (fromScrollable <= 0 || toScrollable <= 0) return

    const progress = fromElement.scrollTop / fromScrollable
    lockRef.current = true
    toElement.scrollTop = progress * toScrollable
    window.requestAnimationFrame(() => {
      lockRef.current = false
    })
  }

  function handleSourceScroll() {
    if (syncingSourceRef.current) return
    syncScroll(sourceScrollRef.current, previewScrollRef.current, syncingPreviewRef)
  }

  function handlePreviewScroll() {
    if (syncingPreviewRef.current) return
    syncScroll(previewScrollRef.current, sourceScrollRef.current, syncingSourceRef)
  }

  function toggleRenderEditMode() {
    setRenderEditMode((current) => !current)
  }

  function activateBlock(block) {
    setActiveBlockId(block.id)
    setActiveBlockDraft(block.text)
    setActionError('')
    setSaveMessage('')
  }

  function updateActiveBlockDraft(value) {
    if (!activeBlock) return

    const nextDraft = normalizeMarkdown(value)
    setActiveBlockDraft(nextDraft)
    setActionError('')
    setSaveMessage('')

    setPostForm((current) => {
      const normalizedContent = normalizeMarkdown(current.content)
      const currentBlocks = parseMarkdownBlocks(normalizedContent)
      const currentActiveBlock = currentBlocks.find((block) => block.id === activeBlock.id)
      if (!currentActiveBlock) return current

      const nextContent = replaceRange(
        normalizedContent,
        currentActiveBlock.startOffset,
        currentActiveBlock.endOffset,
        nextDraft,
      )
      return { ...current, content: nextContent }
    })
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

    setPostMeta((current) =>
      current
        ? {
            ...current,
            title: nextTitle,
            categoryCode: metaDraft.categoryCode,
            category: getCategoryName(metaDraft.categoryCode),
            tags: metaDraft.tags.trim(),
            visibility: metaDraft.visibility,
            anonymous: metaDraft.anonymous,
          }
        : current,
    )

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
            <Link className="post-editor-back" to="/profile">
              ← 返回个人中心
            </Link>
            <div className="post-editor-heading">
              <span className="eyebrow">Markdown 编辑</span>
              <h1>{postForm.title.trim() || '未命名帖子'}</h1>
              <p className="muted">正文支持双栏同步与渲染区块级编辑，元信息仍在弹窗维护。</p>
            </div>
          </div>
          <div className="post-editor-topbar-actions">
            <button className="btn ghost" type="button" onClick={openMetaModal} disabled={loading}>
              编辑文章信息
            </button>
            {postMeta?.status === 'PUBLISHED' ? (
              <Link className="btn outline" to={`/community/${postId}`}>
                查看帖子
              </Link>
            ) : null}
            <button className="btn primary" type="submit" form="post-editor-form" disabled={loading || saving}>
              {saving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </section>

        {loadError ? (
          <section className="feature-card">
            <div className="error-text">{loadError}</div>
            <div className="comment-actions">
              <Link className="btn ghost" to="/profile">
                返回个人中心
              </Link>
              <button className="btn outline" type="button" onClick={() => window.location.reload()}>
                重新加载
              </button>
            </div>
          </section>
        ) : null}

        {loading ? <section className="feature-card">加载中...</section> : null}

        {!loading && !loadError ? (
          <>
            <section className="post-editor-status-strip">
              <span className="post-editor-chip">状态：{statusLabel}</span>
              <span className="post-editor-chip">分类：{getCategoryName(postForm.categoryCode)}</span>
              <span className="post-editor-chip">
                字数：{postContentLength}/{POST_CONTENT_MAX}
              </span>
              <span className="post-editor-chip">行数：{postLineCount}</span>
              <span className="post-editor-chip">更新：{formatDateTime(postMeta?.updatedAt)}</span>
            </section>

            <form id="post-editor-form" className="post-editor-grid" onSubmit={handleSave}>
              <section className={`feature-card post-editor-workspace${renderEditMode ? ' is-render-edit' : ''}`}>
                <div className="post-editor-workspace-head">
                  <div className="post-editor-workspace-head-item">
                    <span className="eyebrow">Source</span>
                    <h2>Markdown 源码</h2>
                  </div>
                  <div className="post-editor-workspace-head-item align-right">
                    <span className="eyebrow">Preview</span>
                    <div className="post-editor-preview-head-row">
                      <h2>渲染预览</h2>
                      <button className="btn ghost small" type="button" onClick={toggleRenderEditMode}>
                        {renderEditMode ? '退出渲染编辑' : '渲染区直接编辑'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="post-editor-workspace-grid">
                  <section className="post-editor-source-pane">
                    <textarea
                      ref={sourceScrollRef}
                      className={`post-editor-sync-textarea${renderEditMode ? ' is-readonly' : ''}`}
                      value={postForm.content}
                      onChange={(event) => updateContent(event.target.value)}
                      onScroll={handleSourceScroll}
                      readOnly={renderEditMode}
                      onFocus={() => {
                        if (!renderEditMode) return
                        blockEditorRef.current?.focus()
                      }}
                      placeholder="在这里编辑 Markdown..."
                      required
                    ></textarea>
                  </section>

                  <section ref={previewScrollRef} className="post-editor-preview-pane" onScroll={handlePreviewScroll}>
                    <article className="post-editor-preview-doc">
                      <header className="post-editor-preview-header">
                        <h2>{postForm.title.trim() || '未命名帖子'}</h2>
                        <div className="post-editor-paper-meta">
                          <span className="post-editor-meta-pill">{getCategoryName(postForm.categoryCode)}</span>
                          <span className="post-editor-meta-pill">
                            {visibilityLabelMap[postForm.visibility] || '公开可见'}
                          </span>
                          {postForm.anonymous ? <span className="post-editor-meta-pill">匿名发布</span> : null}
                          {tagList.map((tag) => (
                            <span className="post-editor-meta-pill" key={tag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </header>

                      {renderEditMode ? (
                        <div className="post-editor-render-blocks">
                          <div className="post-editor-render-tip">
                            点击任意块直接编辑，其他块保持渲染。按 <kbd>Esc</kbd> 可退出当前块。
                          </div>

                          {markdownBlocks.length === 0 ? (
                            <textarea
                              ref={blockEditorRef}
                              className="post-editor-block-editor"
                              value={postForm.content}
                              onChange={(event) => updateContent(event.target.value)}
                              placeholder="开始输入 Markdown..."
                            ></textarea>
                          ) : (
                            markdownBlocks.map((block) => {
                              const isActive = activeBlockId === block.id
                              return (
                                <section
                                  className={`post-editor-render-block${isActive ? ' is-active' : ''}`}
                                  key={block.id}
                                  onClick={() => {
                                    if (isActive) return
                                    activateBlock(block)
                                  }}
                                >
                                  {isActive ? (
                                    <textarea
                                      ref={blockEditorRef}
                                      className="post-editor-block-editor"
                                      value={activeBlockDraft}
                                      onChange={(event) => updateActiveBlockDraft(event.target.value)}
                                      onClick={(event) => event.stopPropagation()}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Escape') {
                                          event.preventDefault()
                                          setActiveBlockId(null)
                                          setActiveBlockDraft('')
                                        }
                                      }}
                                    ></textarea>
                                  ) : (
                                    <MarkdownContent content={block.text} />
                                  )}
                                </section>
                              )
                            })
                          )}
                        </div>
                      ) : postForm.content.trim() ? (
                        <div className="post-editor-live-preview-layer">
                          <MarkdownContent content={postForm.content} />
                        </div>
                      ) : (
                        <div className="post-editor-empty">在左侧开始输入，右侧实时显示渲染效果。</div>
                      )}
                    </article>
                  </section>
                </div>
              </section>
            </form>

            {actionError ? <div className="error-text">{actionError}</div> : null}
            {saveMessage ? <div className="notice-box post-editor-success">{saveMessage}</div> : null}

            <section className="post-editor-footer">
              <div className="post-editor-note">支持“左侧源码编辑”和“右侧块级就地编辑”两种工作流。</div>
              <div className="post-editor-actions">
                <Link className="btn ghost" to="/profile">
                  取消并返回
                </Link>
                <button className="btn primary" type="submit" form="post-editor-form" disabled={saving}>
                  {saving ? '保存中...' : '保存帖子'}
                </button>
              </div>
            </section>
          </>
        ) : null}

        {metaModalOpen ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card post-editor-meta-modal">
              <div className="modal-head">
                <div>
                  <div className="modal-title">编辑文章信息</div>
                  <div className="muted">这里维护标题、分类、标签和发布信息；正文在主页面中编辑。</div>
                </div>
                <button className="icon-btn" type="button" onClick={closeMetaModal}>
                  ×
                </button>
              </div>

              <form className="modal-body" onSubmit={applyMetaChanges}>
                <div className="post-editor-meta-summary">
                  <div>
                    <strong>{metaDraft.title.trim() || '未命名帖子'}</strong>
                    <p className="muted">{postMeta?.sourceFileName || '在线 Markdown 编辑'}</p>
                  </div>
                  <div className="post-editor-meta-tags">
                    <span className="post-editor-meta-pill">{statusLabel}</span>
                    <span className="post-editor-meta-pill">
                      {visibilityLabelMap[metaDraft.visibility] || '公开可见'}
                    </span>
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
                  <span className="field-tip">
                    {metaDraft.title.trim().length}/{POST_TITLE_MAX}
                  </span>
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
                        <option key={item.code} value={item.code}>
                          {item.name}
                        </option>
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
                  <button className="btn ghost" type="button" onClick={closeMetaModal}>
                    取消
                  </button>
                  <button className="btn primary" type="submit">
                    应用到当前编辑页
                  </button>
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
