import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studyAbroadApi } from '../../lib/api.js'
import {
  getMaterialItems,
  saveMaterialItems,
} from './studyAbroadStorage.js'
import '../../App.css'

const countries = ['全部国家', '通用', '英国', '美国', '澳洲', '加拿大', '新加坡']
const stages = ['全部阶段', '身份材料', '学术材料', '语言考试', '文书材料', '网申材料', '签证准备']

function createId() {
  return `material-${Date.now()}`
}

export default function SAMaterialsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState(() => getMaterialItems())
  const [filters, setFilters] = useState({ country: '全部国家', stage: '全部阶段', keyword: '' })
  const [syncNote, setSyncNote] = useState('')
  const [form, setForm] = useState({
    title: '',
    country: '通用',
    stage: '文书材料',
    category: '文书模板',
    deadline: '2026-08-01',
    note: '',
  })

  const canUseRemote = Boolean(token && token !== 'dev-token')

  useEffect(() => {
    if (!canUseRemote) return undefined
    let active = true

    async function loadRemoteMaterials() {
      try {
        const remoteItems = await studyAbroadApi.materials(token)
        if (active) {
          setItems(remoteItems)
          setSyncNote('当前使用后端数据库保存材料清单。')
        }
      } catch {
        if (active) {
          setSyncNote('后端暂不可用，当前使用本地演示材料。')
        }
      }
    }

    loadRemoteMaterials()
    return () => {
      active = false
    }
  }, [canUseRemote, token])

  function updateLocalItems(nextItems) {
    setItems(nextItems)
    saveMaterialItems(nextItems)
  }

  const filteredItems = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return items.filter((item) => {
      const matchCountry = filters.country === '全部国家' || item.country === filters.country
      const matchStage = filters.stage === '全部阶段' || item.stage === filters.stage
      const text = `${item.title} ${item.category} ${item.note}`.toLowerCase()
      const matchKeyword = !keyword || text.includes(keyword)
      return matchCountry && matchStage && matchKeyword
    })
  }, [items, filters])

  const stats = useMemo(() => {
    const completed = items.filter((item) => item.completed).length
    const rate = items.length ? Math.round((completed / items.length) * 100) : 0
    return { completed, rate }
  }, [items])

  async function addItem(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) return

    const payload = {
      title,
      country: form.country,
      stage: form.stage,
      category: form.category.trim() || '其他材料',
      deadline: form.deadline,
      completed: false,
      note: form.note.trim() || '暂无备注',
    }

    if (canUseRemote) {
      try {
        const created = await studyAbroadApi.createMaterial(payload, token)
        setItems([...items, created].sort((a, b) => a.deadline.localeCompare(b.deadline)))
        setSyncNote('材料已保存到后端数据库。')
      } catch (error) {
        setSyncNote(error.message || '后端保存失败，请稍后再试。')
        return
      }
    } else {
      updateLocalItems([...items, { id: createId(), ...payload }])
    }
    setForm({ ...form, title: '', note: '' })
  }

  async function toggleCompleted(targetId) {
    const targetItem = items.find((item) => item.id === targetId)
    if (!targetItem) return
    const nextItem = { ...targetItem, completed: !targetItem.completed }

    if (canUseRemote) {
      try {
        const updated = await studyAbroadApi.updateMaterial(targetId, nextItem, token)
        setItems(items.map((item) => (item.id === targetId ? updated : item)))
        setSyncNote('材料状态已同步到后端。')
      } catch (error) {
        setSyncNote(error.message || '材料状态同步失败，请稍后再试。')
      }
      return
    }

    updateLocalItems(items.map((item) => (
      item.id === targetId ? nextItem : item
    )))
  }

  async function removeItem(targetId) {
    if (canUseRemote) {
      try {
        await studyAbroadApi.deleteMaterial(targetId, token)
        setItems(items.filter((item) => item.id !== targetId))
        setSyncNote('材料已从后端删除。')
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
              <p className="eyebrow">留学 · 资源共享</p>
              <h2>申请材料清单</h2>
              <p className="muted">按国家和阶段核对材料，适合展示留学申请过程管理能力。</p>
            </div>
            <Link className="btn ghost" to="/studyabroad">返回面板</Link>
          </div>

          <div className="grid-two">
            <form className="feature-card" onSubmit={addItem}>
              <div className="card-title">新增材料</div>
              <label className="field">
                <span>材料名称</span>
                <input
                  type="text"
                  value={form.title}
                  placeholder="例如：推荐信第二封"
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <div className="grid-two compact">
                <label className="field">
                  <span>国家/地区</span>
                  <select
                    value={form.country}
                    onChange={(event) => setForm({ ...form, country: event.target.value })}
                  >
                    {countries.slice(1).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>申请阶段</span>
                  <select
                    value={form.stage}
                    onChange={(event) => setForm({ ...form, stage: event.target.value })}
                  >
                    {stages.slice(1).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid-two compact">
                <label className="field">
                  <span>材料类型</span>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>目标日期</span>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>备注</span>
                <textarea
                  rows="3"
                  value={form.note}
                  placeholder="记录格式要求、盖章要求或负责人"
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                />
              </label>
              <button className="btn primary" type="submit">加入清单</button>
            </form>

            <div className="feature-card metrics">
              <div className="card-title">材料进度</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{items.length}</div>
                  <div className="mini-label">总材料</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.completed}</div>
                  <div className="mini-label">已完成</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{stats.rate}%</div>
                  <div className="mini-label">完成率</div>
                </div>
              </div>
              <div className="progress-block">
                <div className="progress-label">材料完成率 {stats.rate}%</div>
                <div className="progress-bar alt"><span style={{ width: `${stats.rate}%` }} /></div>
              </div>
              {syncNote ? <div className="notice-box"><p className="muted">{syncNote}</p></div> : null}
              <div className="filter-grid">
                <label className="field">
                  <span>国家筛选</span>
                  <select
                    value={filters.country}
                    onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                  >
                    {countries.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>阶段筛选</span>
                  <select
                    value={filters.stage}
                    onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
                  >
                    {stages.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>关键词</span>
                <input
                  type="text"
                  value={filters.keyword}
                  placeholder="搜索材料名称、类型或备注"
                  onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="study-list">
            {filteredItems.map((item) => (
              <article className={`study-row ${item.completed ? 'is-complete' : ''}`} key={item.id}>
                <label className="study-check">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleCompleted(item.id)}
                  />
                  <span>{item.completed ? '已完成' : '待准备'}</span>
                </label>
                <div className="study-row-main">
                  <div className="study-row-title">{item.title}</div>
                  <div className="detail-meta">
                    <span>{item.country}</span>
                    <span>{item.stage}</span>
                    <span>{item.category}</span>
                    <span>{item.deadline}</span>
                  </div>
                  <p className="muted">{item.note}</p>
                </div>
                <div className="study-row-side">
                  <button className="btn outline small" type="button" onClick={() => removeItem(item.id)}>
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
