import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { kaogongApi } from '../../lib/api.js'
import '../../App.css'

const features = [
  {
    title: '智能岗位匹配',
    desc: '根据学历、专业、地区、政治面貌等条件自动匹配可报考岗位，支持筛选与收藏。',
    to: '/kaogong/matching',
  },
  {
    title: '历年进面分数线',
    desc: '在分数线页内查询地区、年份、岗位类别、单位类型和考试类别，并收藏重点记录。',
    to: '/kaogong/scores',
  },
  {
    title: '考录全周期日历提醒',
    desc: '按考试订阅提醒，公告、报名、缴费、笔试、面试等事项会按时间推进。',
    to: '/kaogong/calendar',
  },
  {
    title: '模拟面试',
    desc: '创建或加入模拟面试房间，支持讨论区、附件交流和复盘评价。',
    to: '/kaogong/interview',
  },
]

const sharedFeatures = [
  { title: '社区交流', desc: '发帖、评论、点赞、收藏，与考公同伴交流经验。', to: '/community' },
  { title: '题库练习', desc: '章节、随机、模拟三种模式，自动评分与错题沉淀。', to: '/practice' },
]

function daysUntil(dateText) {
  if (!dateText) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateText)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / 86400000)
}

function latestMessageInfo(roomId, messages) {
  const last = messages.at(-1)
  if (!last?.id) return { hasNew: false, lastMessage: null }
  const seen = Number(localStorage.getItem(`kg_room_seen_${roomId}`) || 0)
  return {
    hasNew: Number(last.id) > seen,
    lastMessage: last,
  }
}

export default function KaogongPage() {
  const { token, isAuthed } = useAuth()
  const [countdowns, setCountdowns] = useState([])
  const [favoriteJobs, setFavoriteJobs] = useState([])
  const [scoreLines, setScoreLines] = useState([])
  const [favoriteScoreLines, setFavoriteScoreLines] = useState([])
  const [myRooms, setMyRooms] = useState([])
  const [roomMessages, setRoomMessages] = useState({})
  const [loading, setLoading] = useState(false)

  const canLoadPersonal = isAuthed && token && token !== 'dev-token'

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadPersonal, token])

  async function loadDashboard() {
    setLoading(true)
    try {
      const scoreLineData = await kaogongApi.scoreLines({}).catch(() => [])
      setScoreLines(scoreLineData || [])

      if (!canLoadPersonal) {
        setCountdowns([])
        setFavoriteJobs([])
        setFavoriteScoreLines([])
        setMyRooms([])
        setRoomMessages({})
        return
      }

      const [subscriptions, favorites, scoreFavorites, rooms] = await Promise.all([
        kaogongApi.mySubscriptions(token).catch(() => []),
        kaogongApi.favoriteJobs(token).catch(() => []),
        kaogongApi.favoriteScoreLines(token).catch(() => []),
        kaogongApi.myInterviewRooms(token).catch(() => []),
      ])

      setFavoriteJobs(favorites || [])
      setFavoriteScoreLines(scoreFavorites || [])
      setMyRooms(rooms || [])

      const countdownData = await buildCountdowns(subscriptions || [])
      setCountdowns(countdownData)

      const messageEntries = await Promise.all(
        (rooms || []).map(async (room) => {
          const messages = await kaogongApi.interviewMessages(room.id).catch(() => [])
          return [room.id, messages || []]
        }),
      )
      setRoomMessages(Object.fromEntries(messageEntries))
    } finally {
      setLoading(false)
    }
  }

  async function buildCountdowns(subscriptions) {
    const activeSubscriptions = subscriptions.filter((item) => item.status === 'ACTIVE')
    const entries = await Promise.all(
      activeSubscriptions.map(async (subscription) => {
        const events = await kaogongApi.calendarEvents({
          region: subscription.region,
          examType: subscription.examType,
          year: subscription.examYear || '',
        }).catch(() => [])
        const nextEvent = (events || [])
          .filter((event) => !subscription.eventId || event.id === subscription.eventId)
          .map((event) => ({ ...event, daysLeft: daysUntil(event.eventDate) }))
          .filter((event) => event.daysLeft !== null && event.daysLeft >= 0)
          .sort((a, b) => a.daysLeft - b.daysLeft)[0]

        return nextEvent ? {
          ...nextEvent,
          subscriptionId: subscription.id,
          subscriptionRegion: subscription.region,
          subscriptionExamType: subscription.examType,
        } : null
      }),
    )
    return entries.filter(Boolean).sort((a, b) => a.daysLeft - b.daysLeft)
  }

  const roomsWithMessageState = useMemo(() => {
    return myRooms.map((room) => {
      const info = latestMessageInfo(room.id, roomMessages[room.id] || [])
      return { ...room, ...info }
    })
  }, [myRooms, roomMessages])

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <Link className="page-back" to="/">‹ 返回</Link>
          <div className="section-head">
            <p className="eyebrow">考公考编方向</p>
            <h2>考公考编专属功能面板</h2>
            <p className="muted">岗位匹配、分数线参考、考试日历提醒与模拟面试训练集中在这里。</p>
          </div>

          {!canLoadPersonal ? (
            <div className="notice-box">
              <strong>登录后显示个人面板</strong>
              <p className="muted">真实账号登录后，这里会显示考试倒计时、钟意岗位、收藏分数线和面试房间新消息。</p>
            </div>
          ) : null}

          <div className="grid-two">
            <div className="feature-card highlight">
              <div className="track-head">
                <div className="card-title">考试倒计时</div>
                <Link className="btn ghost small" to="/kaogong/calendar">管理订阅</Link>
              </div>
              {loading ? <p className="muted">加载中...</p> : null}
              {countdowns.length === 0 ? (
                <p className="muted">暂无日历订阅。订阅后会显示某个考试下一事项还有多少天。</p>
              ) : (
                <div className="result-stack">
                  {countdowns.slice(0, 3).map((item) => (
                    <div className="wrong-item" key={`${item.subscriptionId}-${item.id}`}>
                      <div className="track-head">
                        <div className="wrong-title">还有 {item.daysLeft} 天</div>
                        <span className="tag subtle">{item.nodeType}</span>
                      </div>
                      <p className="muted">{item.title}</p>
                      <div className="metric-row">
                        <span>{item.subscriptionRegion}</span>
                        <span>{item.subscriptionExamType}</span>
                        <span>{item.eventDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="feature-card">
              <div className="track-head">
                <div className="card-title">我的钟意岗位</div>
                <Link className="btn ghost small" to="/kaogong/matching">去匹配</Link>
              </div>
              {favoriteJobs.length === 0 ? (
                <p className="muted">暂无收藏岗位。完成岗位匹配后可以收藏心仪岗位。</p>
              ) : (
                <div className="result-stack">
                  {favoriteJobs.slice(0, 3).map((job) => (
                    <div className="wrong-item" key={job.id}>
                      <div className="wrong-title">{job.jobName}</div>
                      <p className="muted">{job.recruitingUnit}</p>
                      <div className="metric-row">
                        <span>{job.region}</span>
                        <span>{job.examType}</span>
                        <span>招 {job.recruitCount} 人</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="feature-card metrics">
              <div className="track-head">
                <div className="card-title">进面分数线参考</div>
                <Link className="btn ghost small" to="/kaogong/scores">查询分数线</Link>
              </div>
              {scoreLines.length === 0 ? (
                <p className="muted">暂无分数线数据。</p>
              ) : (
                <div className="result-stack">
                  {scoreLines.slice(0, 3).map((line) => (
                    <div className="wrong-item" key={line.id}>
                      <div className="track-head">
                        <div className="wrong-title">{line.jobName}</div>
                        <span className="tag subtle">{line.scoreLine}</span>
                      </div>
                      <p className="muted">{line.recruitingUnit}</p>
                      <div className="metric-row">
                        <span>{line.region}</span>
                        <span>{line.year}</span>
                        <span>{line.examType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="feature-card">
              <div className="track-head">
                <div className="card-title">收藏分数线</div>
                <Link className="btn ghost small" to="/kaogong/scores">去收藏</Link>
              </div>
              {favoriteScoreLines.length === 0 ? (
                <p className="muted">暂无收藏分数线。可以在进面分数线页面收藏重点岗位记录。</p>
              ) : (
                <div className="result-stack">
                  {favoriteScoreLines.slice(0, 3).map((line) => (
                    <div className="wrong-item" key={line.id}>
                      <div className="track-head">
                        <div className="wrong-title">{line.jobName}</div>
                        <span className="tag subtle">{line.scoreLine}</span>
                      </div>
                      <p className="muted">{line.recruitingUnit}</p>
                      <div className="metric-row">
                        <span>{line.region}</span>
                        <span>{line.year}</span>
                        <span>进面 {line.interviewCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="feature-card metrics">
            <div className="track-head">
              <div className="card-title">面试房间消息</div>
              <Link className="btn ghost small" to="/kaogong/interview">进入模拟面试</Link>
            </div>
            {roomsWithMessageState.length === 0 ? (
              <p className="muted">暂无已加入房间。加入房间后，有新消息会在这里提示。</p>
            ) : (
              <div className="track-grid">
                {roomsWithMessageState.slice(0, 3).map((room) => (
                  <article className="track-card" key={room.id}>
                    <div className="track-head">
                      <h3>{room.title}</h3>
                      <span className={`tag ${room.hasNew ? '' : 'subtle'}`}>{room.hasNew ? '有新消息' : '已读'}</span>
                    </div>
                    <p className="muted">{room.lastMessage?.content || room.description || '暂无消息'}</p>
                    <div className="metric-row">
                      <span>{room.jobDirection}</span>
                      <span>{room.participantCount} 人</span>
                    </div>
                    <Link className="btn primary small" to={`/kaogong/interview?room=${room.id}`}>进入房间</Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>功能入口</h2>
            <p className="muted">围绕岗位、分数线、提醒和面试训练展开。</p>
          </div>
          <div className="track-grid">
            {features.map((item) => (
              <article className="track-card" key={item.to}>
                <div className="track-head">
                  <h3>{item.title}</h3>
                  <span className="tag subtle">专属</span>
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
            <p className="muted">以下功能对所有方向的注册用户开放。</p>
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
