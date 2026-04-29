import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function ScoreLinePage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考公考编 · 数据参考</p>
            <h2>历年进面分数线查询</h2>
            <p className="muted">按地区、年份、岗位类别查询进面分数线、面试比例与招录人数，为报考决策提供数据参考。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">查询条件</div>
              <div className="filter-grid">
                {['地区', '年份', '岗位类别', '单位类型', '考试类别'].map((label) => (
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
              <p className="muted">结果将展示：进面分数线、面试比例、招录人数、进入面试人数及数据说明。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">分数线数据将在后续版本中导入。</p>
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
