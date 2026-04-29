import { useEffect, useState } from 'react'

function PostComposerModal({ open, onClose, categories, onSubmit, submitting, error }) {
  const TITLE_MAX = 60
  const CONTENT_MAX = 2000

  const [form, setForm] = useState({
    title: '',
    content: '',
    categoryCode: categories[0]?.code || 'kaoyan',
    tags: '',
    visibility: 'public',
    anonymous: false,
    hasAttachment: false,
    attachmentNote: '',
    submitAction: 'publish',
  })
  const [localError, setLocalError] = useState('')
  const categoryCode = categories.find((item) => item.code === form.categoryCode)
    ? form.categoryCode
    : (categories[0]?.code || 'kaoyan')

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
  const contentLength = form.content.trim().length

  function closeModal() {
    setLocalError('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <div className="modal-title">发布帖子</div>
            <div className="muted">选择赛道并填写内容，发布你的经验贴。</div>
          </div>
          <button className="icon-btn" type="button" onClick={closeModal}>x</button>
        </div>
        <form
          className="modal-body"
          onSubmit={(event) => {
            event.preventDefault()
            setLocalError('')
            if (titleLength < 6 || titleLength > TITLE_MAX) {
              setLocalError(`标题需在 6-${TITLE_MAX} 个字符之间`)
              return
            }
            if (contentLength < 20 || contentLength > CONTENT_MAX) {
              setLocalError(`正文需在 20-${CONTENT_MAX} 个字符之间`)
              return
            }
            onSubmit({ ...form, categoryCode })
          }}
        >
          <label className="field">
            <span>标题</span>
            <input
              type="text"
              placeholder="例如：408 三轮复习节奏"
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
              <span>含附件资料</span>
            </label>
          </div>
          {form.hasAttachment ? (
            <label className="field">
              <span>附件说明</span>
              <input
                type="text"
                placeholder="例如：复习计划表（PDF，2MB）"
                value={form.attachmentNote}
                onChange={(event) => {
                  setLocalError('')
                  setForm({ ...form, attachmentNote: event.target.value })
                }}
              />
            </label>
          ) : null}
          <label className="field">
            <span>内容</span>
            <textarea
              rows="5"
              placeholder="分享你的经验、方法和参考资料。"
              value={form.content}
              onChange={(event) => {
                setLocalError('')
                setForm({ ...form, content: event.target.value.slice(0, CONTENT_MAX) })
              }}
              required
            ></textarea>
            <span className="field-tip">{contentLength}/{CONTENT_MAX}</span>
          </label>
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
