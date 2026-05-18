import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studyAbroadApi } from '../../lib/api.js'
import {
  getExperienceItems,
  saveExperienceItems,
} from './studyAbroadStorage.js'
import '../../App.css'

const countries = ['all', 'UK', 'US', 'Australia', 'Canada', 'Singapore']
const topics = ['all', 'School Selection', 'Application', 'Language Test', 'Writing', 'Visa', 'Life Abroad']

const emptyForm = {
  title: '',
  country: 'UK',
  topic: 'Application',
  authorName: '',
  readTime: '5 min',
  summary: '',
  content: '',
  tags: '',
}

function createId() {
  return `experience-${Date.now()}`
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags
  if (!tags) return []
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export default function ExperiencePage() {
  const { token, user } = useAuth()
  const [experiences, setExperiences] = useState(() => getExperienceItems())
  const [filters, setFilters] = useState({ country: 'all', topic: 'all', keyword: '' })
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState('')

  const canUseRemote = Boolean(token && token !== 'dev-token')

  useEffect(() => {
    if (!canUseRemote) return undefined
    let active = true

    async function loadExperiences() {
      try {
        const data = await studyAbroadApi.experiences(filters, token)
        if (active) {
          setExperiences(data)
          setNotice('Loaded study abroad experiences from backend.')
        }
      } catch (error) {
        if (active) {
          setNotice(error.message || 'Backend unavailable. Showing local demo experiences.')
        }
      }
    }

    loadExperiences()
    return () => {
      active = false
    }
  }, [canUseRemote, filters, token])

  const filteredExperiences = useMemo(() => {
    if (canUseRemote) return experiences
    const keyword = filters.keyword.trim().toLowerCase()
    return experiences.filter((item) => {
      const matchCountry = filters.country === 'all' || item.country === filters.country
      const matchTopic = filters.topic === 'all' || item.topic === filters.topic
      const text = `${item.title} ${item.summary} ${normalizeTags(item.tags).join(' ')}`.toLowerCase()
      const matchKeyword = !keyword || text.includes(keyword)
      return matchCountry && matchTopic && matchKeyword
    })
  }, [canUseRemote, experiences, filters])

  function saveLocal(nextItems) {
    setExperiences(nextItems)
    saveExperienceItems(nextItems)
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      ...form,
      title: form.title.trim(),
      authorName: form.authorName.trim() || user?.name || 'Study Abroad Student',
      summary: form.summary.trim(),
      content: form.content.trim(),
      tags: form.tags.trim(),
    }
    if (!payload.title || !payload.summary || !payload.content) {
      setNotice('Title, summary, and content are required.')
      return
    }

    try {
      if (canUseRemote) {
        const created = await studyAbroadApi.createExperience(payload, token)
        setExperiences((current) => [created, ...current])
        setNotice('Experience saved to backend.')
      } else {
        const created = {
          ...payload,
          id: createId(),
          tags: normalizeTags(payload.tags),
        }
        saveLocal([created, ...experiences])
        setNotice('Local experience created.')
      }
      setForm(emptyForm)
    } catch (error) {
      setNotice(error.message || 'Save failed.')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this experience?')) return
    try {
      if (canUseRemote) {
        await studyAbroadApi.deleteExperience(id, token)
        setExperiences((current) => current.filter((item) => item.id !== id))
      } else {
        saveLocal(experiences.filter((item) => item.id !== id))
      }
      setNotice('Experience deleted.')
    } catch (error) {
      setNotice(error.message || 'Delete failed.')
    }
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Study Abroad · Experience</p>
              <h2>Experience Library</h2>
              <p className="muted">Search, filter, and publish study abroad application experience notes.</p>
            </div>
            <Link className="btn ghost" to="/studyabroad">Back to dashboard</Link>
          </div>

          <div className="feature-card">
            <div className="filter-grid">
              <label className="field">
                <span>Country / Region</span>
                <select
                  value={filters.country}
                  onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                >
                  {countries.map((item) => (
                    <option key={item} value={item}>{item === 'all' ? 'All countries' : item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Topic</span>
                <select
                  value={filters.topic}
                  onChange={(event) => setFilters({ ...filters, topic: event.target.value })}
                >
                  {topics.map((item) => (
                    <option key={item} value={item}>{item === 'all' ? 'All topics' : item}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Keyword</span>
              <input
                type="text"
                value={filters.keyword}
                placeholder="Search PS, visa, IELTS, school list, or life abroad"
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

          <form className="feature-card" onSubmit={handleSubmit}>
            <div className="section-head compact">
              <h2>Publish Experience</h2>
              <span className="tag subtle">{canUseRemote ? 'Backend save' : 'Local demo save'}</span>
            </div>
            <div className="filter-grid">
              <label className="field">
                <span>Title</span>
                <input value={form.title} onChange={(event) => updateForm('title', event.target.value)} />
              </label>
              <label className="field">
                <span>Author Name</span>
                <input
                  value={form.authorName}
                  placeholder={user?.name || 'Study Abroad Student'}
                  onChange={(event) => updateForm('authorName', event.target.value)}
                />
              </label>
              <label className="field">
                <span>Country / Region</span>
                <select value={form.country} onChange={(event) => updateForm('country', event.target.value)}>
                  {countries.slice(1).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Topic</span>
                <select value={form.topic} onChange={(event) => updateForm('topic', event.target.value)}>
                  {topics.slice(1).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Read Time</span>
                <input value={form.readTime} onChange={(event) => updateForm('readTime', event.target.value)} />
              </label>
              <label className="field">
                <span>Tags</span>
                <input
                  value={form.tags}
                  placeholder="PS, visa, IELTS"
                  onChange={(event) => updateForm('tags', event.target.value)}
                />
              </label>
            </div>
            <label className="field">
              <span>Summary</span>
              <textarea rows="2" value={form.summary} onChange={(event) => updateForm('summary', event.target.value)} />
            </label>
            <label className="field">
              <span>Content</span>
              <textarea rows="4" value={form.content} onChange={(event) => updateForm('content', event.target.value)} />
            </label>
            <button className="btn primary" type="submit">Publish Experience</button>
          </form>

          {notice ? (
            <div className="notice-box">
              <strong>Data source</strong>
              <p className="muted">{notice}</p>
            </div>
          ) : null}

          <div className="track-grid">
            {filteredExperiences.map((item) => (
              <article className="track-card experience-card" key={item.id}>
                <div className="track-head">
                  <h3>{item.title}</h3>
                  <span className="tag subtle">{item.country}</span>
                </div>
                <div className="detail-meta">
                  <span>{item.topic}</span>
                  <span>{item.authorName}</span>
                  <span>{item.readTime}</span>
                </div>
                <p className="muted">{item.summary}</p>
                {item.content ? <p className="muted">{item.content}</p> : null}
                <div className="tag-row">
                  {normalizeTags(item.tags).map((tag) => (
                    <span className="tag subtle" key={tag}>{tag}</span>
                  ))}
                </div>
                <button className="btn outline small" type="button" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>

          <div className="cta study-cta">
            <div>
              <h2>Want broader discussion?</h2>
              <p className="muted">Use the community study abroad category for longer public discussion posts.</p>
            </div>
            <Link className="btn primary" to="/community?category=liuxue">Open Community</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
