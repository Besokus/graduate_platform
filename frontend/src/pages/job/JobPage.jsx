import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const features = [
  {
    title: '校招宣讲会与网申推送',
    desc: '汇聚宣讲会、网申入口与招聘节点信息，支持按城市、行业、薪资偏好订阅推送。',
    to: '/job/fairs',
  },
  {
    title: '简历模板',
    desc: '提供校招通用版、技术岗版、产品运营版等模板，支持在线填写、保存多版本与导出。',
    to: '/job/resume',
  },
  {
    title: '感兴趣工作推荐',
    desc: '基于专业背景、技能标签、浏览与投递行为，智能推荐匹配岗位。',
    to: '/job/recommend',
  },
  {
    title: '投递跟踪',
    desc: '记录外部平台投递行为，维护投递状态（待投递→已投递→笔试→面试→录用），支持按企业、时间筛选。',
    to: '/job/applications',
  },
]

const sharedFeatures = [
  { title: '社区交流', desc: '发帖、评论、点赞、收藏，与求职同伴交流经验', to: '/community' },
  { title: '题库练习', desc: '章节/随机/模拟三种模式，自动评分与错题本', to: '/practice' },
]

export default function JobPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">就业方向</p>
            <h2>就业党专属功能面板</h2>
            <p className="muted">校招信息推送、简历制作、岗位推荐与投递状态跟踪。</p>
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
