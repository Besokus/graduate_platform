import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function ConsultPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研 · 一对一咨询</p>
            <h2>校友灯塔 1v1 咨询</h2>
            <p className="muted">预约已上岸学长学姐进行一对一经验咨询，支持预约状态流转与咨询记录回顾。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">咨询对象</div>
              <p className="muted">暂无可预约的咨询对象。校友入驻后将展示：身份简介、目标院校/专业、擅长方向与可预约时间。</p>
              <button className="btn primary" type="button" disabled>申请咨询</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">我的预约</div>
              <p className="muted">暂无预约记录。状态包括：待确认 → 已预约 → 已完成 / 已取消。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">咨询预约功能将在后续版本上线。</p>
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
