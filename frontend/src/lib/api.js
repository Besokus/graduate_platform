const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.success) {
    const message = data?.message || `Request failed: ${response.status}`
    throw new Error(message)
  }
  return data.data
}

export const authApi = {
  sendCode(target, type) {
    return request('/api/auth/send-code', { method: 'POST', body: { target, type } })
  },
  register(payload) {
    return request('/api/auth/register', { method: 'POST', body: payload })
  },
  login(payload) {
    return request('/api/auth/login', { method: 'POST', body: payload })
  },
  me(token) {
    return request('/api/auth/me', { token })
  },
  logout(token) {
    return request('/api/auth/logout', { method: 'POST', token })
  },
}

export const communityApi = {
  categories() {
    return request('/api/post-categories')
  },
  posts(params = {}) {
    const search = new URLSearchParams()
    if (params.category) search.set('category', params.category)
    if (params.keyword) search.set('keyword', params.keyword)
    if (params.sort) search.set('sort', params.sort)
    if (params.tag) search.set('tag', params.tag)
    if (typeof params.hasAttachment === 'boolean') {
      search.set('hasAttachment', String(params.hasAttachment))
    }
    search.set('page', String(params.page ?? 0))
    search.set('size', String(params.size ?? 20))
    return request(`/api/posts?${search.toString()}`)
  },
  postDetail(id) {
    return request(`/api/posts/${id}`)
  },
  comments(postId) {
    return request(`/api/posts/${postId}/comments`)
  },
  createPost(payload, token) {
    return request('/api/posts', { method: 'POST', body: payload, token })
  },
  createComment(postId, payload, token) {
    return request(`/api/posts/${postId}/comments`, { method: 'POST', body: payload, token })
  },
}

export const practiceApi = {
  banks(target) {
    const search = new URLSearchParams()
    if (target) search.set('target', target)
    const query = search.toString()
    return request(`/api/question-banks${query ? `?${query}` : ''}`)
  },
  questions(bankId) {
    return request(`/api/question-banks/${bankId}/questions`)
  },
  submitAttempt(questionId, payload, token) {
    return request(`/api/questions/${questionId}/attempt`, {
      method: 'POST',
      body: payload,
      token,
    })
  },
  attempts(userId) {
    return request(`/api/attempts?userId=${userId}`)
  },
}

export const userApi = {
  profile(token) {
    return request('/api/users/me/profile', { token })
  },
  dashboard(token) {
    return request('/api/users/me/dashboard', { token })
  },
}

export const adminApi = {
  dashboard(token) {
    return request('/api/admin/dashboard', { token })
  },
  pendingPosts(page, size, token) {
    return request(`/api/admin/posts/pending?page=${page}&size=${size}`, { token })
  },
  reviewList(status, page, size, token) {
    const q = status ? `?status=${status}&page=${page}&size=${size}` : `?page=${page}&size=${size}`
    return request(`/api/admin/posts${q}`, { token })
  },
  reviewPost(id, action, reason, token) {
    return request(`/api/admin/posts/${id}/review`, {
      method: 'PUT', body: { action, reason }, token,
    })
  },
  users(target, status, page, size, token) {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (target) params.set('target', target)
    if (status) params.set('status', status)
    return request(`/api/admin/users?${params}`, { token })
  },
  updateUserStatus(id, status, reason, token) {
    return request(`/api/admin/users/${id}/status`, {
      method: 'PUT', body: { status, reason }, token,
    })
  },
}
