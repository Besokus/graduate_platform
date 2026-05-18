import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import Pagination from '../../components/Pagination.jsx'
import { kaoyanApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import '../../App.css'

const majorCategories = [
  '', '哲学', '经济学', '法学', '教育学', '文学', '历史学',
  '理学', '工学', '农学', '医学', '军事学', '管理学', '艺术学',
]

const years = ['', '2026', '2025', '2024', '2023', '2022', '2021', '2020']

const emptyFilters = {
  schoolName: '',
  region: '',
  is985: '',
  is211: '',
  isDoubleFirstClass: '',
  majorCategory: '',
  majorName: '',
  year: '',
}

const pageSize = 10

export default function ScoreQueryPage() {
  const { token, isAuthed } = useAuth()
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([])
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, totalElements: 0 })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState(new Set())

  useEffect(() => {
    loadRows()
    if (isAuthed) loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function loadRows(event, nextPage = page) {
    event?.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const params = { ...filters, page: nextPage, size: pageSize }
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === undefined) delete params[k]
      })
      const data = await kaoyanApi.scoreLinesPage(params)
      setRows(data?.content || [])
      setPageInfo({
        totalPages: data?.totalPages || 1,
        totalElements: data?.totalElements || 0,
      })
    } catch (err) {
      setMessage(err.message || '查询失败')
    } finally {
      setLoading(false)
    }
  }

  async function loadFavorites() {
    try {
      const data = await kaoyanApi.favoriteScoreLines(token)
      setFavoriteIds(new Set((data || []).map((f) => f.id)))
    } catch {
      // ignore
    }
  }

  async function handleFilter(event) {
    event.preventDefault()
    setPage(0)
    await loadRows(event, 0)
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setPage(0)
  }

  function toggleCompare(id) {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  async function toggleFavorite(id) {
    if (!isAuthed) {
      setMessage('请先登录')
      return
    }
    try {
      if (favoriteIds.has(id)) {
        await kaoyanApi.unfavoriteScoreLine(id, token)
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        await kaoyanApi.favoriteScoreLine(id, token)
        setFavoriteIds((prev) => new Set([...prev, id]))
      }
    } catch (err) {
      setMessage(err.message || '操作失败')
    }
  }

  const compareRows = rows.filter((r) => compareList.includes(r.id))

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">考研 · 数据查询</p>
            <h2>历年分数线与报录比查询</h2>
            <p className="muted">按院校、专业、年份等多维度查询国家线/复试线、招生人数与报录比，支持收藏与对比。</p>
          </div>
        </section>

        <section className="section">
          <form className="feature-card calendar-filter-panel" onSubmit={handleFilter}>
            <div className="filter-grid">
              <label className="field">
                <span>院校名称</span>
                <input value={filters.schoolName} onChange={(e) => updateFilter('schoolName', e.target.value)} placeholder="模糊搜索" />
              </label>
              <label className="field">
                <span>地区</span>
                <input value={filters.region} onChange={(e) => updateFilter('region', e.target.value)} placeholder="如：北京" />
              </label>
              <label className="field">
                <span>专业门类</span>
                <select value={filters.majorCategory} onChange={(e) => updateFilter('majorCategory', e.target.value)}>
                  <option value="">全部</option>
                  {majorCategories.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="field">
                <span>具体专业</span>
                <input value={filters.majorName} onChange={(e) => updateFilter('majorName', e.target.value)} placeholder="模糊搜索" />
              </label>
              <label className="field">
                <span>年份</span>
                <select value={filters.year} onChange={(e) => updateFilter('year', e.target.value)}>
                  <option value="">全部</option>
                  {years.slice(1).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label className="field">
                <span>985</span>
                <select value={filters.is985} onChange={(e) => updateFilter('is985', e.target.value)}>
                  <option value="">不限</option>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </label>
              <label className="field">
                <span>211</span>
                <select value={filters.is211} onChange={(e) => updateFilter('is211', e.target.value)}>
                  <option value="">不限</option>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </label>
              <label className="field">
                <span>双一流</span>
                <select value={filters.isDoubleFirstClass} onChange={(e) => updateFilter('isDoubleFirstClass', e.target.value)}>
                  <option value="">不限</option>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </label>
            </div>
            <div className="question-actions">
              <button className="btn primary" type="submit" disabled={loading}>{loading ? '查询中...' : '查询'}</button>
              <button className="btn ghost" type="button" onClick={clearFilters}>清空</button>
              {compareList.length >= 2 && (
                <button className="btn outline" type="button" onClick={() => setShowCompare(true)}>
                  对比 ({compareList.length})
                </button>
              )}
            </div>
            {message ? <div className="muted" style={{ marginTop: '8px' }}>{message}</div> : null}
          </form>

          <div className="feature-card">
            <div className="track-head">
              <h3>查询结果</h3>
              <span className="tag subtle">共 {pageInfo.totalElements} 条</span>
            </div>
            {rows.length === 0 && !loading ? (
              <p className="muted">暂无数据，请调整筛选条件</p>
            ) : (
              <div className="score-table-wrap">
                <table className="score-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>院校</th>
                      <th>专业</th>
                      <th>年份</th>
                      <th>总分线</th>
                      <th>政治</th>
                      <th>外语</th>
                      <th>业务课1</th>
                      <th>业务课2</th>
                      <th>计划招生</th>
                      <th>报录比</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className={compareList.includes(row.id) ? 'row-selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={compareList.includes(row.id)}
                            onChange={() => toggleCompare(row.id)}
                          />
                        </td>
                        <td>
                          <strong>{row.schoolName}</strong>
                          <div className="muted small">
                            {row.is985 ? '985 ' : ''}{row.is211 ? '211 ' : ''}{row.isNationalLine ? '国家线' : '院线'}
                          </div>
                        </td>
                        <td>
                          <div>{row.majorName || '-'}</div>
                          <div className="muted small">{row.majorCategory}</div>
                        </td>
                        <td>{row.year}</td>
                        <td><strong>{row.totalScoreLine ?? '-'}</strong></td>
                        <td>{row.politicsLine ?? '-'}</td>
                        <td>{row.foreignLangLine ?? '-'}</td>
                        <td>{row.subject1Line ?? '-'}</td>
                        <td>{row.subject2Line ?? '-'}</td>
                        <td>{row.plannedEnrollment ?? '-'}</td>
                        <td>{row.admissionRatio ? row.admissionRatio + ':1' : '-'}</td>
                        <td>
                          <button
                            className={`btn ghost small ${favoriteIds.has(row.id) ? 'active-fav' : ''}`}
                            type="button"
                            onClick={() => toggleFavorite(row.id)}
                          >
                            {favoriteIds.has(row.id) ? '★ 已收藏' : '☆ 收藏'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              page={page + 1}
              total={pageInfo.totalPages}
              totalItems={pageInfo.totalElements}
              onChange={(nextPage) => setPage(nextPage - 1)}
            />
          </div>
        </section>
      </main>

      {showCompare && compareRows.length >= 2 && (
        <CompareModal rows={compareRows} onClose={() => setShowCompare(false)} onRemove={(id) => {
          setCompareList((prev) => prev.filter((i) => i !== id))
          if (compareList.length <= 2) setShowCompare(false)
        }} />
      )}

      <Footer />
    </div>
  )
}

function CompareModal({ rows, onClose, onRemove }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>分数线对比</h3>
          <button className="btn ghost small" type="button" onClick={onClose}>关闭</button>
        </div>
        <div className="compare-table-wrap">
          <table className="score-table">
            <thead>
              <tr>
                <th>项目</th>
                {rows.map((r) => (
                  <th key={r.id}>
                    {r.schoolName}
                    <div className="muted small">{r.majorName} {r.year}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>总分线</td>
                {rows.map((r) => <td key={r.id}><strong>{r.totalScoreLine ?? '-'}</strong></td>)}
              </tr>
              <tr>
                <td>政治线</td>
                {rows.map((r) => <td key={r.id}>{r.politicsLine ?? '-'}</td>)}
              </tr>
              <tr>
                <td>外语线</td>
                {rows.map((r) => <td key={r.id}>{r.foreignLangLine ?? '-'}</td>)}
              </tr>
              <tr>
                <td>业务课1</td>
                {rows.map((r) => <td key={r.id}>{r.subject1Line ?? '-'}</td>)}
              </tr>
              <tr>
                <td>业务课2</td>
                {rows.map((r) => <td key={r.id}>{r.subject2Line ?? '-'}</td>)}
              </tr>
              <tr>
                <td>计划招生</td>
                {rows.map((r) => <td key={r.id}>{r.plannedEnrollment ?? '-'}</td>)}
              </tr>
              <tr>
                <td>报考人数</td>
                {rows.map((r) => <td key={r.id}>{r.actualApplicants ?? '-'}</td>)}
              </tr>
              <tr>
                <td>报录比</td>
                {rows.map((r) => <td key={r.id}>{r.admissionRatio ? r.admissionRatio + ':1' : '-'}</td>)}
              </tr>
              <tr>
                <td>国家线/院线</td>
                {rows.map((r) => <td key={r.id}>{r.isNationalLine ? '国家线' : '院线'}</td>)}
              </tr>
              <tr>
                <td>操作</td>
                {rows.map((r) => (
                  <td key={r.id}>
                    <button className="btn ghost small" type="button" onClick={() => onRemove(r.id)}>移除</button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}