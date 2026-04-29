import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const templates = [
  { name: '校招通用版', desc: '适用于大多数校招岗位' },
  { name: '技术岗版', desc: '突出项目经历与技术栈' },
  { name: '产品运营版', desc: '侧重数据分析与项目推动能力' },
]

const fields = ['基础信息', '教育经历', '项目经历', '实习经历', '技能证书', '自我评价']

export default function ResumePage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">就业 · 简历工具</p>
            <h2>简历模板</h2>
            <p className="muted">提供多种简历模板，支持在线填写、保存多版本与导出为常见文档格式。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">模板选择</div>
              {templates.map((item) => (
                <div className="room-row" key={item.name}>
                  <div>
                    <div className="room-title">{item.name}</div>
                    <div className="room-sub">{item.desc}</div>
                  </div>
                  <button className="btn outline small" type="button" disabled>使用</button>
                </div>
              ))}
            </div>
            <div className="feature-card metrics">
              <div className="card-title">简历字段</div>
              <ul className="feature-list compact">
                {fields.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">简历编辑与导出功能将在后续版本上线。</p>
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
