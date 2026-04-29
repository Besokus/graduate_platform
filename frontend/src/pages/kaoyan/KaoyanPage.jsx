import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const features = [
  {
    title: '历年分数线与报录比查询',
    desc: '按院校、专业、年份查询国家线/复试线、招生人数、报录比，支持收藏与对比。',
    to: '/kaoyan/scores',
  },
  {
    title: '复习计划与打卡',
    desc: '按阶段、科目制定学习计划，每日打卡记录时长与完成度，自动生成周月统计。',
    to: '/kaoyan/plan',
  },
  {
    title: '备考资料获取与共享',
    desc: '按院校、专业、科目分类检索备考资料，支持上传、审核发布与下载统计。',
    to: '/kaoyan/materials',
  },
  {
    title: '同频自习室',
    desc: '按院校、专业或学习时段加入/创建自习室，在线陪伴学习，学习计时与排行榜。',
    to: '/kaoyan/studyroom',
  },
  {
    title: '校友灯塔 1v1 咨询',
    desc: '预约已上岸学长学姐进行一对一经验咨询，支持预约状态流转与记录回顾。',
    to: '/kaoyan/consult',
  },
]

const sharedFeatures = [
  { title: '社区交流', desc: '发帖、评论、点赞、收藏，与考研同伴交流经验', to: '/community' },
  { title: '题库练习', desc: '章节/随机/模拟三种模式，自动评分与错题本', to: '/practice' },
]

export default function KaoyanPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研方向</p>
            <h2>考研党专属功能面板</h2>
            <p className="muted">院校数据查询、复习计划管理、资料共享、自习陪伴与一对一咨询。</p>
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
