import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const categories = ['院校', '专业', '科目', '年份', '资料类型（笔记/真题/课件/模拟卷）']

export default function MaterialsPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研 · 资源共享</p>
            <h2>备考资料获取与共享</h2>
            <p className="muted">按院校、专业、科目分类检索备考资料，支持上传、审核发布与下载统计。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">分类检索</div>
              <div className="tag-row">
                {categories.map((item) => (
                  <span className="tag subtle" key={item}>{item}</span>
                ))}
              </div>
              <div className="search-row">
                <input type="text" placeholder="搜索资料名称或关键词" disabled />
                <button className="btn primary small" type="button" disabled>搜索</button>
              </div>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">资料列表</div>
              <p className="muted">暂无公开资料。资料上传后将进入审核流程，审核通过后对用户开放下载。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">资料上传与审核功能将在后续版本上线。</p>
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
