import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const statuses = ['待投递', '已投递', '已查看', '笔试通知', '面试通知', '录用', '不通过', '已结束']

export default function ApplicationTrackingPage() {
  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">就业 · 投递管理</p>
            <h2>简历投递跟踪</h2>
            <p className="muted">记录外部平台投递行为，维护投递状态流转，支持按企业、岗位、时间筛选。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">投递状态</div>
              <div className="tag-row">
                {statuses.map((item) => (
                  <span className="tag subtle" key={item}>{item}</span>
                ))}
              </div>
              <button className="btn primary" type="button" disabled>新增投递记录</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">我的投递</div>
              <p className="muted">暂无投递记录。浏览岗位后可跳转外部平台投递，返回系统登记以跟踪进度。</p>
              <div className="notice-box">
                <strong>功能开发中</strong>
                <p className="muted">投递跟踪功能将在后续版本上线，届时可支持与招聘平台接口同步。</p>
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
