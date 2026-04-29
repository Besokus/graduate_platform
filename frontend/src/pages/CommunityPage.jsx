import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PostComposerModal from '../components/PostComposerModal.jsx'
import { communityApi } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../App.css'

const defaultCategories = [
  { id: 'kaoyan', code: 'kaoyan', name: '考研' },
  { id: 'kaogong', code: 'kaogong', name: '考公考编' },
  { id: 'job', code: 'job', name: '就业' },
  { id: 'liuxue', code: 'liuxue', name: '留学' },
  { id: 'experience', code: 'experience', name: '经验分享' },
  { id: 'resource', code: 'resource', name: '资料互助' },
]

const sortOptions = [
  { value: 'latest', label: '按最新发布' },
  { value: 'hot', label: '按热度排序' },
]

const attachmentOptions = [
  { value: 'all', label: '附件：全部' },
  { value: 'yes', label: '仅看有附件' },
  { value: 'no', label: '仅看无附件' },
]

const statusLabelMap = {
  DRAFT: '草稿',
  PENDING: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '驳回',
  OFFLINE: '已下架',
}

function parseTags(post) {
  if (Array.isArray(post.tags)) return post.tags
  if (typeof post.tags === 'string') {
    return post.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (Array.isArray(post.tagList)) return post.tagList
  return []
}

function normalizePost(post) {
  const tags = parseTags(post)
  return {
    ...post,
    tags,
    status: (post.auditStatus || post.status || 'PUBLISHED').toUpperCase(),
    hasAttachment:
      Boolean(post.hasAttachment) ||
      Boolean(post.attachmentUrl) ||
      Boolean(post.attachmentNote) ||
      Boolean(post.fileCount),
    viewCount: post.viewCount ?? post.views ?? 0,
    commentCount: post.commentCount ?? 0,
    likeCount: post.likeCount ?? 0,
    favoriteCount: post.favoriteCount ?? post.collectCount ?? 0,
    reportCount: post.reportCount ?? 0,
  }
}

function CommunityPage() {
  const { isAuthed, user, token } = useAuth()
  const [categories, setCategories] = useState(defaultCategories)
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({
    keyword: '',
    sort: 'latest',
    hasAttachment: 'all',
    tag: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  async function loadPosts(nextCategory = activeCategory, nextFilters = filters) {
    setLoading(true)
    setError('')
    try {
      const [categoryData, postData] = await Promise.all([
        communityApi.categories(),
        communityApi.posts({
          category: nextCategory || undefined,
          keyword: nextFilters.keyword || undefined,
          sort: nextFilters.sort,
          tag: nextFilters.tag || undefined,
          hasAttachment:
            nextFilters.hasAttachment === 'all'
              ? undefined
              : nextFilters.hasAttachment === 'yes',
        }),
      ])

      const normalizedPosts = (postData.content || postData || []).map(normalizePost)
      setCategories(categoryData?.length ? categoryData : defaultCategories)
      setPosts(normalizedPosts)
    } catch (err) {
      setError(err.message || '加载社区失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const availableTags = useMemo(() => {
    const tagSet = new Set(['复习节奏', '资料共享', '岗位信息', '报录比', '模拟面试'])
    posts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).slice(0, 12)
  }, [posts])

  const communityMetrics = useMemo(() => {
    return {
      postCount: posts.length,
      attachmentCount: posts.filter((post) => post.hasAttachment).length,
      pendingCount: posts.filter((post) => post.status === 'PENDING').length,
      reportCount: posts.reduce((sum, post) => sum + post.reportCount, 0),
    }
  }, [posts])

  async function handleCreatePost(form) {
    if (!isAuthed || !user) {
      setPostError('请先登录后发帖')
      return
    }
    setPostError('')
    setPosting(true)
    try {
      await communityApi.createPost(
        {
          title: form.title.trim(),
          content: form.content.trim(),
          categoryCode: form.categoryCode,
          authorId: user.id,
          tags: form.tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          visibility: form.visibility,
          anonymous: form.anonymous,
          hasAttachment: form.hasAttachment,
          attachmentNote: form.attachmentNote?.trim(),
          status: form.submitAction === 'draft' ? 'DRAFT' : 'PENDING',
        },
        token,
      )
      await loadPosts()
      setIsComposerOpen(false)
    } catch (err) {
      setPostError(err.message || '发帖失败')
    } finally {
      setPosting(false)
    }
  }

  async function handleSearch(event) {
    event.preventDefault()
    const next = { ...filters, keyword: keywordInput.trim() }
    setFilters(next)
    await loadPosts(activeCategory, next)
  }

  async function handleCategoryChange(code) {
    setActiveCategory(code)
    await loadPosts(code, filters)
  }

  async function handleFilterChange(name, value) {
    const next = { ...filters, [name]: value }
    setFilters(next)
    await loadPosts(activeCategory, next)
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">社区</p>
            <h2>公开浏览 + 登录互动 + 审核发布</h2>
            <p className="muted">覆盖分类筛选、关键词检索、热度排序、附件识别和状态追踪。</p>
          </div>

          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">检索与筛选</div>
              <form className="search-row" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="搜索帖子标题、正文关键词"
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                />
                <button className="btn primary small" type="submit">搜索</button>
              </form>
              <div className="tag-row">
                <button
                  className={`tag tag-btn ${activeCategory === '' ? 'selected' : ''}`}
                  onClick={() => handleCategoryChange('')}
                  type="button"
                >
                  全部分类
                </button>
                {categories.map((item) => (
                  <button
                    className={`tag tag-btn ${activeCategory === item.code ? 'selected' : ''}`}
                    key={item.id || item.code}
                    onClick={() => handleCategoryChange(item.code)}
                    type="button"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="filter-grid">
                <label className="field">
                  <span>排序方式</span>
                  <select
                    value={filters.sort}
                    onChange={(event) => handleFilterChange('sort', event.target.value)}
                  >
                    {sortOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>附件筛选</span>
                  <select
                    value={filters.hasAttachment}
                    onChange={(event) => handleFilterChange('hasAttachment', event.target.value)}
                  >
                    {attachmentOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="tag-row">
                <span className="muted">热门标签：</span>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag tag-btn ${filters.tag === tag ? 'selected' : ''}`}
                    onClick={() => handleFilterChange('tag', filters.tag === tag ? '' : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="feature-card highlight">
              <div className="card-title">社区态势</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{communityMetrics.postCount}</div>
                  <div className="mini-label">当前帖子</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{communityMetrics.attachmentCount}</div>
                  <div className="mini-label">附件帖子</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{communityMetrics.pendingCount}</div>
                  <div className="mini-label">待审核</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{communityMetrics.reportCount}</div>
                  <div className="mini-label">举报总数</div>
                </div>
              </div>
              <p className="muted">
                {isAuthed
                  ? '你可以发帖、评论、点赞、收藏和举报。'
                  : '当前为游客模式：仅可浏览公开内容，登录后可互动。'}
              </p>
              <button className="btn primary" type="button" onClick={() => setIsComposerOpen(true)}>
                发布帖子
              </button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <p className="eyebrow">帖子列表</p>
            <h2>社区内容</h2>
            {error ? <div className="error-text">{error}</div> : null}
          </div>
          {loading ? (
            <div className="feature-card">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="feature-card">
              <div className="card-title">暂无匹配内容</div>
              <p className="muted">你可以调整筛选条件，或发布第一条相关帖子。</p>
            </div>
          ) : (
            <div className="track-grid">
              {posts.map((post) => (
                <article className="track-card" key={post.id}>
                  <div className="track-head">
                    <h3>{post.title}</h3>
                    <span className="tag subtle">{post.category?.name || post.category?.code || '社区'}</span>
                  </div>
                  <div className="tag-row">
                    <span className="tag subtle">{statusLabelMap[post.status] || '已发布'}</span>
                    <span className="tag subtle">{post.visibility === 'members' ? '仅注册用户可见' : '公开可见'}</span>
                    {post.anonymous ? <span className="tag subtle">匿名发布</span> : null}
                    {post.hasAttachment ? <span className="tag subtle">含附件</span> : null}
                  </div>
                  {post.tags.length ? (
                    <div className="tag-row">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span className="tag subtle" key={`${post.id}-${tag}`}>#{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  <p className="muted">{post.content?.slice(0, 110)}...</p>
                  <div className="metric-row">
                    <span>浏览 {post.viewCount}</span>
                    <span>评论 {post.commentCount}</span>
                    <span>点赞 {post.likeCount}</span>
                    <span>收藏 {post.favoriteCount}</span>
                    <span>举报 {post.reportCount}</span>
                  </div>
                  <div className="panel-footer">
                    <span>{post.anonymous ? '匿名用户' : `作者ID: ${post.authorId}`}</span>
                    <span>{post.createdAt?.replace('T', ' ').slice(0, 16)}</span>
                  </div>
                  <Link className="btn outline small" to={`/community/${post.id}`}>进入详情</Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <PostComposerModal
        open={isComposerOpen}
        onClose={() => {
          setPostError('')
          setIsComposerOpen(false)
        }}
        categories={categories}
        onSubmit={handleCreatePost}
        submitting={posting}
        error={postError}
      />
      <Footer />
    </div>
  )
}

export default CommunityPage
