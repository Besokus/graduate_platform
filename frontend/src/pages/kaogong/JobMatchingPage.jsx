import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const conditions = ['学历', '学位', '专业', '地区偏好', '户籍/生源地', '政治面貌', '岗位类别', '单位类型']

export default function JobMatchingPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考公考编 · 岗位匹配</p>
            <h2>智能岗位匹配</h2>
            <p className="muted">根据个人条件自动筛选可报考岗位，展示岗位名称、招录单位、条件要求与报名时间。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">匹配条件</div>
              <div className="form-grid">
                {conditions.map((label) => (
                  <label className="field" key={label}>
                    <span>{label}</span>
                    <input type="text" placeholder={`请选择${label}`} disabled />
                  </label>
                ))}
              </div>
              <button className="btn primary" type="button" disabled>开始匹配</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">匹配结果</div>
              <p className="muted">结果将展示：岗位名称、招录单位、招录人数、报考条件、考试科目、报名时间与来源链接。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">岗位匹配功能将在后续版本接入数据库后上线。</p>
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
