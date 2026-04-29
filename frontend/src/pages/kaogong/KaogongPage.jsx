import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const features = [
  {
    title: '智能岗位匹配',
    desc: '根据学历、专业、地区、政治面貌等条件自动匹配可报考岗位，支持筛选与收藏。',
    to: '/kaogong/matching',
  },
  {
    title: '历年进面分数线查询',
    desc: '按地区、年份、岗位类别查询进面分数线、面试比例与招录人数。',
    to: '/kaogong/scores',
  },
  {
    title: '考录全周期日历提醒',
    desc: '订阅公告发布、报名、缴费、准考证打印、笔试面试等关键节点，支持站内消息提醒。',
    to: '/kaogong/calendar',
  },
  {
    title: '模拟面试',
    desc: '创建模拟面试房间，邀请同伴按岗位方向练习，支持评价记录与复盘。',
    to: '/kaogong/interview',
  },
]

const sharedFeatures = [
  { title: '社区交流', desc: '发帖、评论、点赞、收藏，与考公同伴交流经验', to: '/community' },
  { title: '题库练习', desc: '章节/随机/模拟三种模式，自动评分与错题本', to: '/practice' },
]

export default function KaogongPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考公考编方向</p>
            <h2>考公考编党专属功能面板</h2>
            <p className="muted">岗位匹配、分数线参考、考试日历提醒与模拟面试训练。</p>
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
