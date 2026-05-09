import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studyAbroadApi } from '../../lib/api.js'
import {
  getTimelineItems,
  saveTimelineItems,
} from './studyAbroadStorage.js'
import '../../App.css'

const statusLabels = {
  todo: '待开始',
  doing: '进行中',
  done: '已完成',
}

const phases = ['全部阶段', '语言考试', '选校定位', '文书材料', '网申提交', '面试准备', '签证准备']

function daysLeft(dateText) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateText}T00:00:00`)
  return Math.ceil((target - today) / 86400000)
}

function createId() {
  return `timeline-${Date.now()}`
}

export default function TimelinePage() {
  const { token } = useAuth()
  const [items, setItems] = useState(() => getTimelineItems())
  const [phase, setPhase] = useState('全部阶段')
  const [syncNote, setSyncNote] = useState('')
  const [form, setForm] = useState({
    title: '',
    country: '英国',
    school: '',
    phase: '文书材料',
    dueDate: '2026-09-01',
    note: '',
  })

  const canUseRemote = Boolean(token && token !== 'dev-token')

  useEffect(() => {
    if (!canUseRemote) return undefined
    let active = true

    async function loadRemoteTimeline() {
      try {
        const remoteItems = await studyAbroadApi.timeline(token)
        if (active) {
          setItems(remoteItems)
          setSyncNote('当前使用后端数据库保存时间线。')
        }
      } catch {
        if (active) {
          setSyncNote('后端暂不可用，当前使用本地演示时间线。')
        }
      }
    }

    loadRemoteTimeline()
    return () => {
      active = false
    }
  }, [canUseRemote, token])

  function updateLocalItems(nextItems) {
    setItems(nextItems)
    saveTimelineItems(nextItems)
  }

  const filteredItems = useMemo(() => {
    const nextItems = phase === '全部阶段'
      ? items
      : items.filter((item) => item.phase === phase)
    return [...nextItems].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [items, phase])

  const stats = useMemo(() => {
    const done = items.filter((item) => item.status === 'done').length
    const doing = items.filter((item) => item.status === 'doing').length
    const rate = items.length ? Math.round((done / items.length) * 100) : 0
    return { done, doing, rate }
  }, [items])

  async function addItem(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) return

    const payload = {
      title,
      country: form.country.trim() || '未填写',
      school: form.school.trim() || '目标院校待定',
      phase: form.phase,
      dueDate: form.dueDate,
      status: 'todo',
      note: form.note.trim() || '暂无备注',
    }

    if (canUseRemote) {
      try {
        const created = await studyAbroadApi.createTimeline(payload, token)
        setItems([...items, created].sort((a, b) => a.dueDate.localeCompare(b.dueDate)))
        setSyncNote('节点已保存到后端数据库。')
      } catch (error) {
        setSyncNote(error.message || '后端保存失败，请稍后再试。')
        return
      }
    } else {
      updateLocalItems([...items, { id: createId(), ...payload }])
    }
    setForm({ ...form, title: '', school: '', note: '' })
  }

  async function cycleStatus(targetId) {
    const order = ['todo', 'doing', 'done']
    const targetItem = items.find((item) => item.id === targetId)
    if (!targetItem) return
    const nextIndex = (order.indexOf(targetItem.status) + 1) % order.length
    const nextItem = { ...targetItem, status: order[nextIndex] }

    if (canUseRemote) {
      try {
        const updated = await studyAbroadApi.updateTimeline(targetId, nextItem, token)
        setItems(items.map((item) => (item.id === targetId ? updated : item)))
        setSyncNote('节点状态已同步到后端。')
      } catch (error) {
        setSyncNote(error.message || '状态同步失败，请稍后再试。')
      }
      return
    }

    updateLocalItems(items.map((item) => {
      if (item.id !== targetId) return item
      const nextIndex = (order.indexOf(item.status) + 1) % order.length
      return { ...item, status: order[nextIndex] }
    }))
  }

  async function removeItem(targetId) {
    if (canUseRemote) {
      try {
        await studyAbroadApi.deleteTimeline(targetId, token)
        setItems(items.filter((item) => item.id !== targetId))
        setSyncNote('节点已从后端删除。')
      } catch (error) {
        setSyncNote(error.message || '删除失败，请稍后再试。')
      }
      return
    }
    updateLocalItems(items.filter((item) => item.id !== targetId))
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="detail-header">
            <div>
              <p className="eyebrow">留学 · 时间管理</p>
              <h2>申请时间线管理</h2>
              <p className="muted">新增申请节点、切换完成状态，并按阶段查看后续任务。</p>
            </div>
            <Link className="btn ghost" to="/studyabroad">返回面板</Link>
          </div>

          <div className="grid-two">
            <form className="feature-card" onSubmit={addItem}>
              <div className="card-title">新增申请节点</div>
              <label className="field">
                <span>节点名称</span>
                <input
                  type="text"
                  value={form.title}
                  placeholder="例如：完成 PS 第二稿"
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <div className="grid-two compact">
                <label className="field">
                  <span>国家/地区</span>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(event) => setForm({ ...form, country: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>目标院校</span>
                  <input
                    type="text"
                    value={form.school}
                    placeholder="可留空"
                    onChange={(event) => setForm({ ...form, school: event.target.value })}
                  />
                </label>
              </div>
              <div className="grid-two compact">
                <label className="field">
                  <span>阶段</span>
                  <select
                    value={form.phase}
                    onChange={(event) => setForm({ ...form, phase: event.target.value })}
                  >
                    {phases.slice(1).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>截止日期</span>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>备注</span>
                <textarea
                  rows="3"
                  value={form.note}
                  placeholder="写下材料、提醒或下一步动作"
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                />
              </label>
              <button className="btn primary" type="submit">添加节点</button>
            </form>

            <div className="feature-card metrics">
              <div className="card-title">申请进度</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{items.length}</div>
                  <div className="mini-label">总节点</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.doing}</div>
                  <div className="mini-label">进行中</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.done}</div>
                  <div className="mini-label">已完成</div>
                </div>
              </div>
              <div className="progress-block">
                <div className="progress-label">完成率 {stats.rate}%</div>
                <div className="progress-bar"><span style={{ width: `${stats.rate}%` }} /></div>
              <div className="progress-note">点击节点状态按钮可在“待开始/进行中/已完成”之间切换。</div>
            </div>
              {syncNote ? <div className="notice-box"><p className="muted">{syncNote}</p></div> : null}
              <label className="field">
                <span>阶段筛选</span>
                <select value={phase} onChange={(event) => setPhase(event.target.value)}>
                  {phases.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="study-list">
            {filteredItems.map((item) => {
              const left = daysLeft(item.dueDate)
              return (
                <article className="study-row" key={item.id}>
                  <div className={`study-status ${item.status}`}>
                    {statusLabels[item.status]}
                  </div>
                  <div className="study-row-main">
                    <div className="study-row-title">{item.title}</div>
                    <div className="detail-meta">
                      <span>{item.country}</span>
                      <span>{item.school}</span>
                      <span>{item.phase}</span>
                      <span>{item.dueDate}</span>
                    </div>
                    <p className="muted">{item.note}</p>
                  </div>
                  <div className="study-row-side">
                    <span className={`tag ${left < 0 ? 'danger' : 'subtle'}`}>
                      {left < 0 ? `逾期 ${Math.abs(left)} 天` : `剩余 ${left} 天`}
                    </span>
                    <button className="btn ghost small" type="button" onClick={() => cycleStatus(item.id)}>
                      切换状态
                    </button>
                    <button className="btn outline small" type="button" onClick={() => removeItem(item.id)}>
                      删除
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
