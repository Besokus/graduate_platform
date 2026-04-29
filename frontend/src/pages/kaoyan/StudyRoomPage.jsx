import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function StudyRoomPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研 · 陪伴学习</p>
            <h2>同频自习室</h2>
            <p className="muted">按院校、专业或学习时段加入/创建自习室，在线陪伴学习，支持学习计时与排行榜。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">自习室列表</div>
              <p className="muted">暂无开放的自习室。</p>
              <div className="tag-row">
                <span className="tag subtle">按院校筛选</span>
                <span className="tag subtle">按专业筛选</span>
                <span className="tag subtle">按时段筛选</span>
              </div>
              <button className="btn primary" type="button" disabled>创建自习室</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">学习排行</div>
              <p className="muted">暂无排行数据。加入自习室后学习计时将计入排行榜。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">自习室功能将在后续版本上线。</p>
              </div>
            </div>
          </div>
          <Link className="btn ghost" to="/kaoyan">返回考研面板</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
