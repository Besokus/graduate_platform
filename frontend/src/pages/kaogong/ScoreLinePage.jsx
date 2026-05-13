import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import Pagination from '../../components/Pagination.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { kaogongApi } from '../../lib/api.js'
import '../../App.css'

const initialFilters = {
  region: '',
  year: '',
  jobCategory: '',
  unitType: '',
  examType: '',
}

const SCORE_LINE_PAGE_SIZE = 6

export default function ScoreLinePage() {
  const { token, isAuthed } = useAuth()
  const [filters, setFilters] = useState(initialFilters)
  const [lines, setLines] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [linePage, setLinePage] = useState(1)
  const [lineTotalPages, setLineTotalPages] = useState(1)
  const [lineTotalItems, setLineTotalItems] = useState(0)

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites])

  useEffect(() => {
    loadScoreLines()
    loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function getRealToken() {
    return token && token !== 'dev-token' ? token : localStorage.getItem('gp_token')
  }

  async function loadScoreLines(event, nextPage = 1) {
    event?.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const data = await kaogongApi.scoreLinesPage({
        ...filters,
        page: nextPage - 1,
        size: SCORE_LINE_PAGE_SIZE,
      })
      setLines(data?.content || [])
      setLinePage(nextPage)
      setLineTotalPages(data?.totalPages || 1)
      setLineTotalItems(data?.totalElements || 0)
      if (!data?.content?.length) setMessage('暂无匹配分数线，请调整筛选条件。')
    } catch (err) {
      setMessage(err.message || '分数线加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function handlePageChange(nextPage) {
    await loadScoreLines(null, nextPage)
  }

  async function loadFavorites() {
    const realToken = getRealToken()
    if (!isAuthed || !realToken || realToken === 'dev-token') return
    const data = await kaogongApi.favoriteScoreLines(realToken).catch(() => [])
    setFavorites(data || [])
  }

  async function handleToggleFavorite(id) {
    const realToken = getRealToken()
    if (!isAuthed || !realToken || realToken === 'dev-token') {
      setMessage('请先使用真实账号登录后收藏进面分数线。')
      return
    }
    try {
      if (favoriteIds.has(id)) {
        await kaogongApi.unfavoriteScoreLine(id, realToken)
        setMessage('已取消收藏。')
      } else {
        await kaogongApi.favoriteScoreLine(id, realToken)
        setMessage('分数线已收藏。')
      }
      await loadFavorites()
    } catch (err) {
      setMessage(err.message || '操作失败')
    }
  }

  const highestLine = lines.reduce((best, item) => {
    const score = Number(item.scoreLine || 0)
    return score > Number(best?.scoreLine || 0) ? item : best
  }, null)
  const visibleLines = lines

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <Link className="page-back" to="/kaogong">‹ 返回</Link>
          <div className="section-head">
            <p className="eyebrow">考公考编 · 数据参考</p>
            <h2>历年进面分数线</h2>
            <p className="muted">查询条件直接在分数线页内完成，收藏后会同步展示到考公专属首页。</p>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <p className="eyebrow">进面分数线</p>
            <h2>查询与收藏</h2>
          </div>

          <form className="feature-card calendar-filter-panel" onSubmit={loadScoreLines}>
            <div className="filter-grid">
              <label className="field">
                <span>地区</span>
                <input value={filters.region} onChange={(event) => updateField('region', event.target.value)} placeholder="如：北京/上海/江苏" />
              </label>
              <label className="field">
                <span>年份</span>
                <input value={filters.year} onChange={(event) => updateField('year', event.target.value)} placeholder="如：2026" />
              </label>
              <label className="field">
                <span>岗位类别</span>
                <select value={filters.jobCategory} onChange={(event) => updateField('jobCategory', event.target.value)}>
                  <option value="">全部</option>
                  <option>综合管理</option>
                  <option>行政执法</option>
                  <option>专业技术</option>
                </select>
              </label>
              <label className="field">
                <span>单位类型</span>
                <select value={filters.unitType} onChange={(event) => updateField('unitType', event.target.value)}>
                  <option value="">全部</option>
                  <option>中央机关直属机构</option>
                  <option>地方机关</option>
                  <option>事业单位</option>
                </select>
              </label>
              <label className="field">
                <span>考试类别</span>
                <select value={filters.examType} onChange={(event) => updateField('examType', event.target.value)}>
                  <option value="">全部</option>
                  <option>国家公务员考试</option>
                  <option>上海市公务员考试</option>
                  <option>事业单位考试</option>
                </select>
              </label>
            </div>
            <div className="question-actions">
              <button className="btn primary" type="submit" disabled={loading}>{loading ? '查询中...' : '查询分数线'}</button>
              <button className="btn ghost" type="button" onClick={() => setFilters(initialFilters)}>清空条件</button>
            </div>
            {message ? <div className="muted">{message}</div> : null}
          </form>

          <div className="feature-card metrics">
            <div className="mini-grid">
              <div className="mini-card">
                <div className="mini-value">{lineTotalItems}</div>
                <div className="mini-label">记录数</div>
              </div>
              <div className="mini-card">
                <div className="mini-value">{highestLine?.scoreLine || '-'}</div>
                <div className="mini-label">最高分</div>
              </div>
              <div className="mini-card">
                <div className="mini-value">{favorites.length}</div>
                <div className="mini-label">已收藏</div>
              </div>
            </div>
          </div>

          {lines.length === 0 ? (
            <div className="feature-card">暂无匹配数据，请调整筛选条件。</div>
          ) : (
            <div className="track-grid">
              {visibleLines.map((line) => (
                <article className="track-card" key={line.id}>
                  <div className="track-head">
                    <div>
                      <h3>{line.jobName}</h3>
                      <p className="muted">{line.recruitingUnit}</p>
                    </div>
                    <span className="tag subtle">{line.scoreLine}</span>
                  </div>
                  <div className="metric-row">
                    <span>{line.region}</span>
                    <span>{line.year}</span>
                    <span>{line.examType}</span>
                  </div>
                  <div className="metric-row">
                    <span>面试比例 {line.interviewRatio}</span>
                    <span>招录 {line.recruitCount}</span>
                    <span>进面 {line.interviewCount}</span>
                  </div>
                  <p className="muted">{line.dataNote}</p>
                  <div className="question-actions">
                    <button className="btn outline small" type="button" onClick={() => handleToggleFavorite(line.id)}>
                      {favoriteIds.has(line.id) ? '已收藏' : '收藏'}
                    </button>
                    <span className="tag subtle">{line.source}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
          <Pagination
            page={linePage}
            total={lineTotalPages}
            totalItems={lineTotalItems}
            onChange={handlePageChange}
          />
        </section>
      </main>
      <Footer />
    </div>
  )
}
