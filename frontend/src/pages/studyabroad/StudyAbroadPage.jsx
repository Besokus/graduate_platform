import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const features = [
  {
    title: '申请时间线管理',
    desc: '按目标院校创建申请时间线，设置关键节点提醒，支持逐阶段复盘。',
    to: '/studyabroad/timeline',
  },
  {
    title: '语言与文书资料库',
    desc: '按国家、院校、专业分类留学资料，支持上传、审核与下载。',
    to: '/studyabroad/materials',
  },
  {
    title: '留学经验社区',
    desc: '浏览和分享申请经验、选校策略、签证攻略与海外生活贴士。',
    to: '/studyabroad/experience',
  },
]

const sharedFeatures = [
  { title: '社区交流', desc: '发帖、评论、点赞、收藏，与留学同伴交流经验', to: '/community' },
  { title: '题库练习', desc: '章节/随机/模拟三种模式，自动评分与错题本', to: '/practice' },
]

export default function StudyAbroadPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">留学方向</p>
            <h2>留学用户专属功能面板</h2>
            <p className="muted">申请时间线管理、文书资料库、经验分享与互助社区。</p>
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
