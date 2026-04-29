import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const sampleFilters = [
  '院校名称', '地区', '院校层次（985/211/双一流）', '专业门类', '具体专业', '年份',
]

export default function ScoreQueryPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研 · 数据查询</p>
            <h2>历年分数线与报录比查询</h2>
            <p className="muted">按院校、专业、年份等多维度查询国家线/复试线、招生人数与报录比，支持收藏与对比。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">筛选条件</div>
              <div className="filter-grid">
                {sampleFilters.map((label) => (
                  <label className="field" key={label}>
                    <span>{label}</span>
                    <input type="text" placeholder={`请选择${label}`} disabled />
                  </label>
                ))}
              </div>
              <button className="btn primary" type="button" disabled>查询</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">查询结果</div>
              <p className="muted">结果将展示：年份、国家线/复试线、计划招生人数、报考人数、报录比及备注说明。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">该功能将在后续版本中接入真实数据，敬请期待。</p>
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
