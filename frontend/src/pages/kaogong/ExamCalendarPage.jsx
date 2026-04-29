import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const nodes = [
  '公告发布', '报名开始', '报名截止', '资格审查',
  '缴费截止', '准考证打印', '笔试', '成绩公布', '面试',
]

export default function ExamCalendarPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考公考编 · 时间管理</p>
            <h2>考录全周期日历提醒</h2>
            <p className="muted">订阅关键考试节点，支持站内消息、短信、邮件等多种提醒方式。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">提醒节点</div>
              <ul className="feature-list">
                {nodes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="filter-grid">
                <label className="field">
                  <span>地区</span>
                  <select disabled><option>请选择地区</option></select>
                </label>
                <label className="field">
                  <span>考试类型</span>
                  <select disabled><option>请选择类型</option></select>
                </label>
              </div>
              <button className="btn primary" type="button" disabled>订阅提醒</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">我的订阅</div>
              <p className="muted">暂无订阅。提醒方式：站内消息（必选）、短信/邮件（扩展）。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">日历提醒功能将在后续版本上线。</p>
              </div>
            </div>
          </div>
          <Link className="btn ghost" to="/kaogong">返回考公面板</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
