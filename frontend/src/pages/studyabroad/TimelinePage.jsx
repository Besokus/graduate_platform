import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function TimelinePage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">留学 · 时间管理</p>
            <h2>申请时间线管理</h2>
            <p className="muted">按目标院校创建申请时间线，设置关键节点提醒，支持逐阶段复盘与调整。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">时间线节点</div>
              <ul className="feature-list compact">
                <li>语言考试报名与出分</li>
                <li>选校与专业确定</li>
                <li>文书准备（PS/CV/推荐信）</li>
                <li>网申提交截止</li>
                <li>面试准备与参加</li>
                <li>Offer 确认与签证</li>
              </ul>
              <button className="btn primary" type="button" disabled>创建时间线</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">我的进度</div>
              <p className="muted">暂未创建申请时间线。创建后可追踪各节点完成状态与倒计时。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">时间线管理功能将在后续版本上线。</p>
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
