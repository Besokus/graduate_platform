import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function CareerFairPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">就业 · 信息汇聚</p>
            <h2>校招宣讲会与网申推送</h2>
            <p className="muted">汇聚宣讲会、网申入口与招聘节点信息，支持按城市、行业、薪资偏好设置推送。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">偏好设置</div>
              <div className="form-grid">
                {['城市', '行业', '岗位类别', '薪资范围', '企业类型'].map((label) => (
                  <label className="field" key={label}>
                    <span>{label}</span>
                    <input type="text" placeholder={`请选择${label}`} disabled />
                  </label>
                ))}
              </div>
              <button className="btn primary" type="button" disabled>保存偏好</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">宣讲会列表</div>
              <p className="muted">暂无推送信息。信息将展示：企业名称、岗位、时间、地点、网申截止时间与链接。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">宣讲会推送功能将在后续版本上线。</p>
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
