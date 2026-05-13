import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../../App.css'

const countries = ['全部国家', '英国', '美国', '澳洲', '加拿大', '新加坡']
const topics = ['全部主题', '选校策略', '申请经验', '语言备考', '文书写作', '签证攻略', '海外生活']

const experiences = [
  {
    id: 'uk-ps',
    title: '英国授课型硕士 PS 写作节奏',
    country: '英国',
    topic: '文书写作',
    author: '留学学姐 A',
    readTime: '6 分钟',
    summary: '先确定课程匹配点，再把项目经历和职业目标连起来，避免把 PS 写成简历复述。',
    tags: ['PS', '课程匹配', '申请材料'],
  },
  {
    id: 'us-school',
    title: '美国项目选校的冲刺/匹配/保底拆分',
    country: '美国',
    topic: '选校策略',
    author: 'CS 申请者 B',
    readTime: '8 分钟',
    summary: '用 GPA、语言成绩、科研/实习经历和项目录取偏好做分层，减少盲投。',
    tags: ['选校', 'CS', '定位'],
  },
  {
    id: 'au-visa',
    title: '澳洲学生签证材料准备清单',
    country: '澳洲',
    topic: '签证攻略',
    author: '南半球观察员',
    readTime: '5 分钟',
    summary: '整理护照、COE、资金证明和体检节点，提前检查材料有效期。',
    tags: ['签证', '资金证明', 'COE'],
  },
  {
    id: 'sg-language',
    title: '新加坡申请的语言成绩规划',
    country: '新加坡',
    topic: '语言备考',
    author: 'NUS 申请记录',
    readTime: '4 分钟',
    summary: '把语言考试时间倒排到申请截止前，给二刷和送分预留缓冲。',
    tags: ['雅思', '托福', '时间规划'],
  },
]

export default function ExperiencePage() {
  const [filters, setFilters] = useState({ country: '全部国家', topic: '全部主题', keyword: '' })

  const filteredExperiences = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return experiences.filter((item) => {
      const matchCountry = filters.country === '全部国家' || item.country === filters.country
      const matchTopic = filters.topic === '全部主题' || item.topic === filters.topic
      const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase()
      const matchKeyword = !keyword || text.includes(keyword)
      return matchCountry && matchTopic && matchKeyword
    })
  }, [filters])

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="detail-header">
            <div>
              <p className="eyebrow">留学 · 经验交流</p>
              <h2>留学经验筛选</h2>
              <p className="muted">按国家、主题和关键词查看经验卡片，后续可与社区留学分类打通。</p>
            </div>
            <Link className="btn ghost" to="/studyabroad">返回面板</Link>
          </div>

          <div className="feature-card">
            <div className="filter-grid">
              <label className="field">
                <span>国家/地区</span>
                <select
                  value={filters.country}
                  onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                >
                  {countries.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>主题</span>
                <select
                  value={filters.topic}
                  onChange={(event) => setFilters({ ...filters, topic: event.target.value })}
                >
                  {topics.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>关键词</span>
              <input
                type="text"
                value={filters.keyword}
                placeholder="搜索 PS、签证、语言、选校等关键词"
                onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
              />
            </label>
            <div className="tag-row">
              {topics.slice(1).map((topic) => (
                <button
                  className={`tag tag-btn ${filters.topic === topic ? 'selected' : 'subtle'}`}
                  type="button"
                  key={topic}
                  onClick={() => setFilters({ ...filters, topic })}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="track-grid">
            {filteredExperiences.map((item) => (
              <article className="track-card experience-card" key={item.id}>
                <div className="track-head">
                  <h3>{item.title}</h3>
                  <span className="tag subtle">{item.country}</span>
                </div>
                <div className="detail-meta">
                  <span>{item.topic}</span>
                  <span>{item.author}</span>
                  <span>{item.readTime}</span>
                </div>
                <p className="muted">{item.summary}</p>
                <div className="tag-row">
                  {item.tags.map((tag) => (
                    <span className="tag subtle" key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="cta study-cta">
            <div>
              <h2>想发布自己的申请经验？</h2>
              <p className="muted">进入社区并选择“留学”分类，就能把经验沉淀到公共交流区。</p>
            </div>
            <Link className="btn primary" to="/community?category=liuxue">进入留学社区</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
