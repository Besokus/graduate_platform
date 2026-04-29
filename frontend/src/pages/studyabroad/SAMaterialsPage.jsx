import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

export default function SAMaterialsPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">留学 · 资源共享</p>
            <h2>语言与文书资料库</h2>
            <p className="muted">按国家、院校、专业分类留学资料，包括语言备考、文书模板、签证攻略等，支持上传与下载。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">分类检索</div>
              <div className="tag-row">
                {['国家', '院校', '专业', '语言考试', '文书模板', '签证'].map((item) => (
                  <span className="tag subtle" key={item}>{item}</span>
                ))}
              </div>
              <div className="search-row">
                <input type="text" placeholder="搜索资料关键词" disabled />
                <button className="btn primary small" type="button" disabled>搜索</button>
              </div>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">资料列表</div>
              <p className="muted">暂无公开资料。资料上传后进入审核流程，审核通过后开放下载。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">留学资料库功能将在后续版本上线。</p>
              </div>
            </div>
          </div>
          <Link className="btn ghost" to="/studyabroad">返回留学面板</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
