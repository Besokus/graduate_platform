import { useEffect, useRef, useState } from 'react'
import MarkdownContent from './MarkdownContent.jsx'

const TITLE_MAX = 60
const CONTENT_MAX = 50000

function buildInitialForm(categories) {
  return {
    title: '',
    markdownFile: null,
    markdownFileName: '',
    markdownContent: '',
    categoryCode: categories[0]?.code || 'kaoyan',
    tags: '',
    visibility: 'public',
    anonymous: false,
    hasAttachment: false,
    attachmentNote: '',
    submitAction: 'publish',
  }
}

function extractMarkdownTitle(content, fileName) {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine.startsWith('#')) continue
    const title = trimmedLine.replace(/^#{1,6}\s*/, '').trim()
    if (title) return title
  }
  return fileName.replace(/\.[^.]+$/, '')
}

async function readMarkdownFile(file) {
  const fileName = file?.name || ''
  const lowerName = fileName.toLowerCase()
  if (!lowerName.endsWith('.md') && !lowerName.endsWith('.markdown')) {
    throw new Error('请上传 .md 或 .markdown 文件')
  }

  const rawContent = await file.text()
  return rawContent.replace(/\r\n/g, '\n').trim()
}

function PostComposerModal({ open, onClose, categories, onSubmit, submitting, error }) {
  const [form, setForm] = useState(() => buildInitialForm(categories))
  const [localError, setLocalError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setLocalError('')
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const titleLength = form.title.trim().length
  const contentLength = form.markdownContent.length
  const categoryCode = categories.find((item) => item.code === form.categoryCode)
    ? form.categoryCode
    : (categories[0]?.code || 'kaoyan')

  function closeModal() {
    setLocalError('')
    onClose()
  }

  function clearNativeFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setLocalError('')
    try {
      const markdownContent = await readMarkdownFile(file)
      const nextTitle = form.title.trim() || extractMarkdownTitle(markdownContent, file.name)
      setForm((current) => ({
        ...current,
        title: nextTitle.slice(0, TITLE_MAX),
        markdownFile: file,
        markdownFileName: file.name,
        markdownContent,
      }))
    } catch (fileError) {
      setForm((current) => ({
        ...current,
        markdownFile: null,
        markdownFileName: '',
        markdownContent: '',
      }))
      clearNativeFileInput()
      setLocalError(fileError.message || 'Markdown 文件读取失败')
    }
  }

  function clearFile() {
    setLocalError('')
    setForm((current) => ({
      ...current,
      markdownFile: null,
      markdownFileName: '',
      markdownContent: '',
    }))
    clearNativeFileInput()
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card composer-modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">发布帖子</div>
            <div className="muted">上传 Markdown 文档作为正文内容，系统会读取文件并创建社区帖子。</div>
          </div>
          <button className="icon-btn" type="button" onClick={closeModal}>x</button>
        </div>
        <form
          className="modal-body"
          onSubmit={(event) => {
            event.preventDefault()
            setLocalError('')
            if (!form.markdownFile) {
              setLocalError('请先选择 Markdown 文件')
              return
            }
            if (titleLength < 6 || titleLength > TITLE_MAX) {
              setLocalError(`标题需在 6-${TITLE_MAX} 个字符之间`)
              return
            }
            if (contentLength < 20 || contentLength > CONTENT_MAX) {
              setLocalError(`Markdown 正文需在 20-${CONTENT_MAX} 个字符之间`)
              return
            }
            onSubmit({ ...form, categoryCode })
          }}
        >
          <label className="field">
            <span>Markdown 文件</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,text/markdown,text/plain"
              onChange={handleFileChange}
              required
            />
            <span className="field-tip">仅支持 `.md` / `.markdown`，正文长度 20-50000 字符</span>
          </label>

          {form.markdownFileName ? (
            <div className="notice-box">
              <strong>已选择文件</strong>
              <p className="muted">{form.markdownFileName}</p>
              <p className="muted">正文长度：{contentLength}/{CONTENT_MAX}</p>
              <button className="btn ghost small" type="button" onClick={clearFile}>
                重新选择
              </button>
            </div>
          ) : null}

          <label className="field">
            <span>标题</span>
            <input
              type="text"
              placeholder="可手动填写；留空时会优先取 Markdown 一级标题"
              value={form.title}
              onChange={(event) => {
                setLocalError('')
                setForm({ ...form, title: event.target.value.slice(0, TITLE_MAX) })
              }}
              required
            />
            <span className="field-tip">{titleLength}/{TITLE_MAX}</span>
          </label>

          <label className="field">
            <span>赛道</span>
            <select
              value={categoryCode}
              onChange={(event) => {
                setLocalError('')
                setForm({ ...form, categoryCode: event.target.value })
              }}
            >
              {categories.map((item) => (
                <option key={item.code} value={item.code}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>标签</span>
            <input
              type="text"
              placeholder="用英文逗号分隔，如：复试,资料,经验"
              value={form.tags}
              onChange={(event) => {
                setLocalError('')
                setForm({ ...form, tags: event.target.value })
              }}
            />
          </label>

          <div className="grid-two compact">
            <label className="field">
              <span>可见范围</span>
              <select
                value={form.visibility}
                onChange={(event) => {
                  setLocalError('')
                  setForm({ ...form, visibility: event.target.value })
                }}
              >
                <option value="public">公开可见</option>
                <option value="members">仅注册用户可见</option>
              </select>
            </label>
            <label className="field">
              <span>发布状态</span>
              <select
                value={form.submitAction}
                onChange={(event) => {
                  setLocalError('')
                  setForm({ ...form, submitAction: event.target.value })
                }}
              >
                <option value="publish">提交发布</option>
                <option value="draft">保存草稿</option>
              </select>
            </label>
          </div>

          <div className="switch-row">
            <label className="switch-item">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(event) => {
                  setLocalError('')
                  setForm({ ...form, anonymous: event.target.checked })
                }}
              />
              <span>匿名发布（前台隐藏身份）</span>
            </label>
            <label className="switch-item">
              <input
                type="checkbox"
                checked={form.hasAttachment}
                onChange={(event) => {
                  setLocalError('')
                  setForm({ ...form, hasAttachment: event.target.checked })
                }}
              />
              <span>另含附加资料</span>
            </label>
          </div>

          {form.hasAttachment ? (
            <label className="field">
              <span>附加资料说明</span>
              <input
                type="text"
                placeholder="例如：附 PDF、真题汇总、外链资料等"
                value={form.attachmentNote}
                onChange={(event) => {
                  setLocalError('')
                  setForm({ ...form, attachmentNote: event.target.value })
                }}
              />
            </label>
          ) : null}

          {form.markdownContent ? (
            <div className="field">
              <span>正文预览（原始 Markdown）</span>
              <div className="notice-box composer-preview">
                <MarkdownContent content={form.markdownContent} />
              </div>
            </div>
          ) : null}

          {localError ? <div className="error-text">{localError}</div> : null}
          {error ? <div className="error-text">{error}</div> : null}
          <div className="modal-actions">
            <button className="btn ghost" type="button" onClick={closeModal}>取消</button>
            <button className="btn primary" type="submit" disabled={submitting}>
              {submitting ? '发布中...' : '发布'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostComposerModal
