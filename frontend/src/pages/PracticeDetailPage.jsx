import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { practiceApi } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../App.css'

function safeParseOptions(rawOptions) {
  if (Array.isArray(rawOptions)) return rawOptions
  if (!rawOptions) return []
  try {
    const options = JSON.parse(rawOptions)
    return Array.isArray(options) ? options : []
  } catch {
    return []
  }
}

function mapQuestion(question) {
  return {
    ...question,
    options: safeParseOptions(question.optionsJson || question.options),
    chapter: question.chapter || '未分章节',
    difficulty: (question.difficulty || 'middle').toLowerCase(),
  }
}

function PracticeDetailPage() {
  const { id } = useParams()
  const { user, token, isAuthed } = useAuth()
  const [questions, setQuestions] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState('chapter')
  const [answers, setAnswers] = useState({})
  const [markedMap, setMarkedMap] = useState({})
  const [result, setResult] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [submitMessage, setSubmitMessage] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const questionData = await practiceApi.questions(id)
        if (active) {
          setQuestions((questionData || []).map(mapQuestion))
          setStartedAt(Date.now())
          setAnswers({})
          setMarkedMap({})
          setResult(null)
          setSubmitMessage('')
          setSyncMessage('')
          setCurrentIndex(0)
        }
        if (user?.id) {
          const attemptData = await practiceApi.attempts(user.id)
          if (active) {
            setAttempts(attemptData || [])
          }
        }
      } catch (err) {
        if (active) {
          setError(err.message || '加载题目失败')
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
  }, [id, user?.id])

  const current = questions[currentIndex]

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

  const answeredCurrent = current ? answers[current.id] : ''

  const historicalWrongCount = useMemo(
    () => attempts.filter((item) => item.correct === false).length,
    [attempts],
  )

  async function handleSubmitPaper() {
    if (!questions.length) return
    if (!startedAt) {
      setSubmitMessage('练习尚未开始，请刷新后重试。')
      return
    }

    const finishedAt = Date.now()
    const answerEntries = questions
      .map((question) => ({
        question,
        selected: answers[question.id] || '',
      }))
      .filter((entry) => entry.selected)

    if (!answerEntries.length) {
      setSubmitMessage('请至少完成 1 题后再交卷。')
      return
    }

    const wrongQuestions = answerEntries
      .filter((entry) => entry.selected !== entry.question.answer)
      .map((entry) => ({
        id: entry.question.id,
        stem: entry.question.stem,
        answer: entry.question.answer,
        selected: entry.selected,
        analysis: entry.question.analysis,
      }))

    const correctCount = answerEntries.length - wrongQuestions.length
    const accuracy = Math.round((correctCount / answerEntries.length) * 100)
    const durationSeconds = Math.max(1, Math.floor((finishedAt - startedAt) / 1000))

    setResult({
      totalCount: questions.length,
      answeredCount: answerEntries.length,
      correctCount,
      wrongCount: wrongQuestions.length,
      accuracy,
      durationSeconds,
      wrongQuestions,
      finishedAt,
    })
    setSubmitMessage('已完成交卷，成绩和错题清单已生成。')
  }

  async function handleSyncAttempts() {
    if (!result || !isAuthed || !user || !token) {
      setSyncMessage('登录后可将本次记录同步到个人历史。')
      return
    }

    const answerEntries = questions
      .map((question) => ({
        question,
        selected: answers[question.id] || '',
      }))
      .filter((entry) => entry.selected)

    if (!answerEntries.length) {
      setSyncMessage('暂无可同步的答题记录。')
      return
    }

    setSyncing(true)
    setSyncMessage('')
    try {
      const settled = await Promise.allSettled(
        answerEntries.map((entry) =>
          practiceApi.submitAttempt(
            entry.question.id,
            {
              userId: user.id,
              answer: entry.selected,
            },
            token,
          ),
        ),
      )

      const successResults = settled
        .filter((item) => item.status === 'fulfilled')
        .map((item) => item.value)

      setAttempts((prev) => [...prev, ...successResults])
      setSyncMessage(`已同步 ${successResults.length}/${answerEntries.length} 条记录。`)
    } catch (err) {
      setSyncMessage(err.message || '同步失败，请稍后重试。')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">题库详情</p>
            <h2>题号导航 + 答案暂存 + 一键交卷</h2>
            <p className="muted">支持章节练习、随机练习、模拟练习，并自动生成成绩统计和错题清单。</p>
            {error ? <div className="error-text">{error}</div> : null}
          </div>

          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">练习配置</div>
              <div className="filter-grid">
                <label className="field">
                  <span>练习模式</span>
                  <select value={mode} onChange={(event) => setMode(event.target.value)}>
                    <option value="chapter">章节练习</option>
                    <option value="random">随机练习</option>
                    <option value="mock">模拟练习</option>
                  </select>
                </label>
                <label className="field">
                  <span>已作答进度</span>
                  <div className="field-pill">{answeredCount}/{questions.length}</div>
                </label>
              </div>
              <div className="progress-block">
                <div className="progress-bar">
                  <span
                    style={{
                      width: `${questions.length ? Math.round((answeredCount / questions.length) * 100) : 0}%`,
                    }}
                  ></span>
                </div>
              </div>
              <div className="question-nav">
                {questions.map((question, index) => {
                  const answered = Boolean(answers[question.id])
                  const marked = Boolean(markedMap[question.id])
                  const active = index === currentIndex
                  return (
                    <button
                      key={question.id}
                      type="button"
                      className={`question-nav-btn ${active ? 'active' : ''} ${answered ? 'answered' : ''} ${marked ? 'marked' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
              <button className="btn primary" type="button" onClick={handleSubmitPaper}>
                交卷并查看结果
              </button>
              {submitMessage ? <div className="muted">{submitMessage}</div> : null}
            </div>

            <div className="feature-card metrics">
              <div className="card-title">个人历史统计</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{attempts.length}</div>
                  <div className="mini-label">历史答题数</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{historicalWrongCount}</div>
                  <div className="mini-label">历史错题数</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">
                    {attempts.length ? Math.round(((attempts.length - historicalWrongCount) / attempts.length) * 100) : 0}%
                  </div>
                  <div className="mini-label">历史正确率</div>
                </div>
              </div>
              <p className="muted">登录后可同步本次记录至个人历史和错题本。</p>
            </div>
          </div>
        </section>

        <section className="section">
          {loading ? (
            <div className="feature-card">加载中...</div>
          ) : !current ? (
            <div className="feature-card">当前题库暂无题目。</div>
          ) : (
            <div className="grid-two">
              <div className="feature-card soft">
                <div className="track-head">
                  <h3>第 {currentIndex + 1} 题</h3>
                  <span className="tag subtle">{current.chapter}</span>
                </div>
                <div className="question-stem">{current.stem}</div>
                <div className="question-options">
                  {current.options.map((option, index) => {
                    const optionKey = String.fromCharCode(65 + index)
                    return (
                      <button
                        className={`option-btn ${answeredCurrent === optionKey ? 'active' : ''}`}
                        key={optionKey}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [current.id]: optionKey,
                          }))
                        }
                        type="button"
                      >
                        <span className="option-key">{optionKey}</span>
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="question-actions">
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  >
                    上一题
                  </button>
                  <button
                    className="btn outline"
                    type="button"
                    onClick={() =>
                      setMarkedMap((prev) => ({
                        ...prev,
                        [current.id]: !prev[current.id],
                      }))
                    }
                  >
                    {markedMap[current.id] ? '取消标记' : '标记复查'}
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  >
                    下一题
                  </button>
                </div>
                {result ? (
                  <div className="analysis">
                    <div>本题正确答案：{current.answer}</div>
                    <div className="muted">{current.analysis || '暂无解析'}</div>
                  </div>
                ) : null}
              </div>

              <div className="feature-card">
                <div className="card-title">本次交卷结果</div>
                {!result ? (
                  <p className="muted">交卷后展示总题数、正确率、用时和错题清单。</p>
                ) : (
                  <div className="result-stack">
                    <div className="metric-row">
                      <span>总题数 {result.totalCount}</span>
                      <span>已作答 {result.answeredCount}</span>
                    </div>
                    <div className="metric-row">
                      <span>正确 {result.correctCount}</span>
                      <span>错误 {result.wrongCount}</span>
                    </div>
                    <div className="metric-row">
                      <span>正确率 {result.accuracy}%</span>
                      <span>用时 {result.durationSeconds}s</span>
                    </div>
                    <button
                      className="btn primary small"
                      type="button"
                      onClick={handleSyncAttempts}
                      disabled={syncing}
                    >
                      {syncing ? '同步中...' : '同步到历史记录'}
                    </button>
                    {syncMessage ? <div className="muted">{syncMessage}</div> : null}
                    {result.wrongQuestions.length ? (
                      <div className="wrong-list">
                        {result.wrongQuestions.map((item) => (
                          <div className="wrong-item" key={item.id}>
                            <div className="wrong-title">{item.stem}</div>
                            <div className="muted">你的答案：{item.selected} / 正确答案：{item.answer}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="muted">本次无错题，继续保持。</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <Link className="btn ghost" to="/practice">返回题库</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PracticeDetailPage
