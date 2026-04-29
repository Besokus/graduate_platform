import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function MockInterviewPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考公考编 · 面试训练</p>
            <h2>模拟面试</h2>
            <p className="muted">创建模拟面试房间，邀请同伴按岗位方向练习，支持评价记录与复盘查看。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">面试房间</div>
              <p className="muted">暂无进行中的模拟面试。</p>
              <div className="filter-grid">
                <label className="field">
                  <span>岗位方向</span>
                  <input type="text" placeholder="如：税务/公安/综合岗" disabled />
                </label>
                <label className="field">
                  <span>预约时段</span>
                  <input type="text" placeholder="选择时间" disabled />
                </label>
              </div>
              <button className="btn primary" type="button" disabled>创建房间</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">我的记录</div>
              <p className="muted">暂无面试记录。完成后可查看评价与复盘笔记。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">模拟面试功能将在后续版本上线。</p>
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
