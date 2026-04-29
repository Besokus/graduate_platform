import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const topics = ['选校策略', '申请经验', '语言备考', '文书写作', '签证攻略', '海外生活']

export default function ExperiencePage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">留学 · 经验交流</p>
            <h2>留学经验社区</h2>
            <p className="muted">浏览和分享申请经验、选校策略、签证攻略与海外生活贴士，与留学同伴互助交流。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">话题分类</div>
              <div className="tag-row">
                {topics.map((item) => (
                  <span className="tag subtle" key={item}>{item}</span>
                ))}
              </div>
              <button className="btn primary" type="button" disabled>发布经验</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">热门经验</div>
              <p className="muted">暂无经验分享。成为第一个分享留学经验的用户吧。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">留学经验社区将在后续版本与社区模块打通。</p>
              </div>
            </div>
          </div>
          <Link className="btn ghost" to="/studyabroad">返回留学面板</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
