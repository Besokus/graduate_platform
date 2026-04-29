import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function StudyPlanPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研 · 过程管理</p>
            <h2>复习计划与打卡</h2>
            <p className="muted">按阶段、科目制定学习计划，设置目标与提醒时间；每日打卡记录时长与完成度，自动生成周月统计。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">当前计划</div>
              <p className="muted">暂无进行中的计划。</p>
              <button className="btn primary" type="button" disabled>创建新计划</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">打卡统计</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">0</div>
                  <div className="mini-label">连续打卡</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">0</div>
                  <div className="mini-label">本周完成</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">0%</div>
                  <div className="mini-label">计划完成率</div>
                </div>
              </div>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">计划创建与打卡功能将在后续版本上线。</p>
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
