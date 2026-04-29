import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { practiceApi } from '../lib/api.js'
import '../App.css'

const trackOptions = [
  { code: '', label: '全部方向' },
  { code: 'kaoyan', label: '考研' },
  { code: 'kaogong', label: '考公考编' },
  { code: 'job', label: '就业' },
  { code: 'liuxue', label: '留学' },
]

const modeOptions = [
  { value: 'all', label: '全部模式' },
  { value: 'chapter', label: '章节练习' },
  { value: 'random', label: '随机练习' },
  { value: 'mock', label: '模拟练习' },
]

const difficultyOptions = [
  { value: 'all', label: '全部难度' },
  { value: 'easy', label: '基础' },
  { value: 'middle', label: '进阶' },
  { value: 'hard', label: '冲刺' },
]

function normalizeModes(bank) {
  if (Array.isArray(bank.supportedModes) && bank.supportedModes.length) return bank.supportedModes
  return ['chapter', 'random', 'mock']
}

function normalizeBank(bank) {
  return {
    ...bank,
    supportedModes: normalizeModes(bank),
    difficulty: (bank.difficulty || 'middle').toLowerCase(),
    target: bank.target || 'general',
    chapterCount: bank.chapterCount ?? bank.chapters ?? 0,
    questionCount: bank.questionCount ?? bank.totalQuestions ?? 0,
  }
}

function PracticePage() {
  const [target, setTarget] = useState('')
  const [mode, setMode] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await practiceApi.banks(target)
        if (active) {
          setBanks((data || []).map(normalizeBank))
        }
      } catch (err) {
        if (active) {
          setError(err.message || '加载题库失败')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [target])

  const filteredBanks = useMemo(() => {
    return banks.filter((bank) => {
      const modeMatched = mode === 'all' || bank.supportedModes.includes(mode)
      const difficultyMatched = difficulty === 'all' || bank.difficulty === difficulty
      return modeMatched && difficultyMatched
    })
  }, [banks, mode, difficulty])

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">题库练习</p>
            <h2>题库分类管理 + 多模式练习 + 结果统计</h2>
            <p className="muted">支持章节练习、随机练习、模拟练习，交卷后自动生成错题清单。</p>
          </div>
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">方向筛选</div>
              <div className="tag-row">
                {trackOptions.map((item) => (
                  <button
                    key={item.code || 'all'}
                    type="button"
                    className={`tag tag-btn ${target === item.code ? 'selected' : ''}`}
                    onClick={() => setTarget(item.code)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="filter-grid">
                <label className="field">
                  <span>练习模式</span>
                  <select value={mode} onChange={(event) => setMode(event.target.value)}>
                    {modeOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>难度筛选</span>
                  <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                    {difficultyOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">训练范围概览</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{filteredBanks.length}</div>
                  <div className="mini-label">可练题库</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">
                    {filteredBanks.reduce((sum, bank) => sum + bank.questionCount, 0)}
                  </div>
                  <div className="mini-label">题目总量</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">
                    {filteredBanks.reduce((sum, bank) => sum + bank.chapterCount, 0)}
                  </div>
                  <div className="mini-label">章节总量</div>
                </div>
              </div>
              <p className="muted">题库字段支持方向、科目、章节、题型、难度、年份扩展。</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <p className="eyebrow">题库列表</p>
            <h2>可用题库</h2>
            {error ? <div className="error-text">{error}</div> : null}
          </div>

          {loading ? (
            <div className="feature-card">加载中...</div>
          ) : filteredBanks.length === 0 ? (
            <div className="feature-card">
              <div className="card-title">暂无匹配题库</div>
              <p className="muted">请调整筛选条件，或稍后再试。</p>
            </div>
          ) : (
            <div className="track-grid">
              {filteredBanks.map((bank) => (
                <article className="track-card" key={bank.id}>
                  <div className="track-head">
                    <h3>{bank.name}</h3>
                    <span className="tag subtle">{bank.target}</span>
                  </div>
                  <p className="muted">{bank.description || '支持按章节、随机与模拟模式训练。'}</p>
                  <div className="metric-row">
                    <span>题量 {bank.questionCount}</span>
                    <span>章节 {bank.chapterCount}</span>
                    <span>难度 {bank.difficulty}</span>
                  </div>
                  <div className="tag-row">
                    {bank.supportedModes.map((item) => (
                      <span className="tag subtle" key={`${bank.id}-${item}`}>{item}</span>
                    ))}
                  </div>
                  <Link className="btn outline small" to={`/practice/${bank.id}`}>进入题库</Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PracticePage

