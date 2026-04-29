import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function JobRecommendPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">就业 · 智能推荐</p>
            <h2>感兴趣工作推荐</h2>
            <p className="muted">基于专业背景、技能标签、浏览行为与投递记录，智能推荐匹配岗位。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">推荐依据</div>
              <ul className="feature-list compact">
                <li>专业背景与技能标签</li>
                <li>意向行业与岗位类别</li>
                <li>浏览记录与收藏行为</li>
                <li>已投递岗位分析</li>
              </ul>
              <button className="btn primary" type="button" disabled>刷新推荐</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">推荐结果</div>
              <p className="muted">暂无推荐。请完善个人资料以获取更精准的岗位推荐。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">岗位推荐算法将在后续版本中实现。</p>
              </div>
            </div>
          </div>
          <Link className="btn ghost" to="/job">返回就业面板</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
