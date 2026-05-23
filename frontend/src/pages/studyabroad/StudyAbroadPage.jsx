import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studyAbroadApi } from '../../lib/api.js'
import {
  getMaterialItems,
  getTimelineItems,
} from './studyAbroadStorage.js'
import '../../App.css'

const features = [
  {
    title: 'Application Projects',
    desc: 'Track target schools, programs, rounds, deadlines, status, and priority in one place.',
    to: '/studyabroad/applications',
    metric: 'Project tracking',
  },
  {
    title: '申请时间线管理',
    desc: '管理语言考试、选校、文书、网申、面试和签证节点。',
    to: '/studyabroad/timeline',
    metric: '节点追踪',
  },
  {
    title: '申请材料清单',
    desc: '按国家、阶段和类型核对护照、成绩单、文书和签证材料。',
    to: '/studyabroad/materials',
    metric: '材料核对',
  },
  {
    title: '留学经验筛选',
    desc: '按国家和主题查看选校、语言备考、签证与海外生活经验。',
    to: '/studyabroad/experience',
    metric: '经验参考',
  },
]

const sharedFeatures = [
  { title: '社区交流', desc: '进入社区留学分类，发布经验或查看同伴讨论', to: '/community?category=liuxue' },
  { title: '题库练习', desc: '使用通用题库练习能力，保留刷题记录和错题反馈', to: '/practice' },
]

function getSoonestPending(items) {
  return items
    .filter((item) => item.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
}

export default function StudyAbroadPage() {
  const { token } = useAuth()
  const [timelineItems] = useState(() => getTimelineItems())
  const [materialItems] = useState(() => getMaterialItems())
  const [remoteTimelineItems, setRemoteTimelineItems] = useState(null)
  const [remoteMaterialItems, setRemoteMaterialItems] = useState(null)
  const [syncNote, setSyncNote] = useState('')

  const canUseRemote = Boolean(token && token !== 'dev-token')

  useEffect(() => {
    if (!canUseRemote) return undefined
    let active = true

    async function loadRemoteSummary() {
      try {
        const [timeline, materials] = await Promise.all([
          studyAbroadApi.timeline(token),
          studyAbroadApi.materials(token),
        ])
        if (active) {
          setRemoteTimelineItems(timeline)
          setRemoteMaterialItems(materials)
          setSyncNote('已加载后端保存的留学申请数据。')
        }
      } catch {
        if (active) {
          setSyncNote('后端暂不可用，当前展示本地演示数据。')
        }
      }
    }

    loadRemoteSummary()
    return () => {
      active = false
    }
  }, [canUseRemote, token])

  const displayTimelineItems = remoteTimelineItems || timelineItems
  const displayMaterialItems = remoteMaterialItems || materialItems

  const summary = useMemo(() => {
    const doneNodes = displayTimelineItems.filter((item) => item.status === 'done').length
    const doneMaterials = displayMaterialItems.filter((item) => item.completed).length
    const nextNode = getSoonestPending(displayTimelineItems)
    return {
      nodeTotal: displayTimelineItems.length,
      nodeDone: doneNodes,
      nodeRate: displayTimelineItems.length
        ? Math.round((doneNodes / displayTimelineItems.length) * 100)
        : 0,
      materialTotal: displayMaterialItems.length,
      materialDone: doneMaterials,
      materialRate: displayMaterialItems.length
        ? Math.round((doneMaterials / displayMaterialItems.length) * 100)
        : 0,
      nextNode,
    }
  }, [displayTimelineItems, displayMaterialItems])

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="study-hero">
          <div className="study-hero-main">
            <p className="eyebrow">留学方向</p>
            <h1>留学申请工作台</h1>
            <p className="lead">
              把申请时间线、材料清单和经验参考集中在一个入口，适合结课演示，也方便后续接入真实后端。
            </p>
            <div className="hero-actions">
              <Link className="btn primary" to="/studyabroad/timeline">管理时间线</Link>
              <Link className="btn ghost" to="/studyabroad/materials">核对材料</Link>
            </div>
          </div>

          <div className="study-dashboard">
            <div className="mini-grid">
              <div className="mini-card">
                <div className="mini-value">{summary.nodeRate}%</div>
                <div className="mini-label">时间线完成</div>
              </div>
              <div className="mini-card">
                <div className="mini-value">{summary.materialRate}%</div>
                <div className="mini-label">材料完成</div>
              </div>
              <div className="mini-card">
                <div className="mini-value">{summary.nodeTotal + summary.materialTotal}</div>
                <div className="mini-label">申请事项</div>
              </div>
            </div>
            <div className="progress-block">
              <div className="progress-label">申请节点 {summary.nodeDone}/{summary.nodeTotal}</div>
              <div className="progress-bar"><span style={{ width: `${summary.nodeRate}%` }} /></div>
            </div>
            <div className="progress-block">
              <div className="progress-label">材料清单 {summary.materialDone}/{summary.materialTotal}</div>
              <div className="progress-bar alt"><span style={{ width: `${summary.materialRate}%` }} /></div>
            </div>
            <div className="notice-box">
              <strong>下一项</strong>
              <p className="muted">
                {summary.nextNode
                  ? `${summary.nextNode.dueDate} · ${summary.nextNode.title}`
                  : '所有申请节点都已完成'}
              </p>
            </div>
            {syncNote ? (
              <div className="notice-box">
                <strong>数据来源</strong>
                <p className="muted">{syncNote}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>专属功能</h2>
            <p className="muted">真实登录后使用后端保存，开发模式下保留本地演示数据。</p>
          </div>
          <div className="track-grid">
            {features.map((item) => (
              <article className="track-card" key={item.to}>
                <div className="track-head">
                  <h3>{item.title}</h3>
                  <span className="tag subtle">{item.metric}</span>
                </div>
                <p className="muted">{item.desc}</p>
                <Link className="btn primary small" to={item.to}>进入功能</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>通用功能入口</h2>
            <p className="muted">留学方向复用平台已有社区与题库能力。</p>
          </div>
          <div className="grid-two">
            {sharedFeatures.map((item) => (
              <div className="feature-card soft" key={item.to}>
                <div className="card-title">{item.title}</div>
                <p className="muted">{item.desc}</p>
                <Link className="btn outline small" to={item.to}>前往</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
