export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: isFormData
      ? options.body
      : (options.body ? JSON.stringify(options.body) : undefined),
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
  posts(params = {}, token) {
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
    return request(`/api/posts?${search.toString()}`, { token })
  },
  postDetail(id, token) {
    return request(`/api/posts/${id}`, { token })
  },
  comments(postId, token) {
    return request(`/api/posts/${postId}/comments`, { token })
  },
  createPost(payload, token) {
    return request('/api/posts', { method: 'POST', body: payload, token })
  },
  createComment(postId, payload, token) {
    return request(`/api/posts/${postId}/comments`, { method: 'POST', body: payload, token })
  },
  toggleLike(postId, token) {
    return request(`/api/posts/${postId}/like`, { method: 'POST', token })
  },
  toggleFavorite(postId, token) {
    return request(`/api/posts/${postId}/favorite`, { method: 'POST', token })
  },
  reportPost(postId, reason, token) {
    return request(`/api/posts/${postId}/report`, {
      method: 'POST',
      body: { reason },
      token,
    })
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


function appendParams(path, params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `${path}?${query}` : path
}

export const employmentApi = {
  fairs(params = {}) {
    return request(appendParams('/api/job/fairs', params))
  },
  postings(params = {}) {
    return request(appendParams('/api/job/postings', params))
  },
  preference(token) {
    return request('/api/job/preferences', { token })
  },
  savePreference(payload, token) {
    return request('/api/job/preferences', { method: 'PUT', body: payload, token })
  },
  resume(token) {
    return request('/api/job/resume', { token })
  },
  saveResume(payload, token) {
    return request('/api/job/resume', { method: 'PUT', body: payload, token })
  },
  recommendations(params = {}, token) {
    return request(appendParams('/api/job/recommendations', params), { token })
  },
  applications(token) {
    return request('/api/job/applications', { token })
  },
  createApplication(payload, token) {
    return request('/api/job/applications', { method: 'POST', body: payload, token })
  },
  updateApplication(id, payload, token) {
    return request(`/api/job/applications/${id}`, { method: 'PUT', body: payload, token })
  },
  deleteApplication(id, token) {
    return request(`/api/job/applications/${id}`, { method: 'DELETE', token })
  },
  notifications(token) {
    return request('/api/job/notifications', { token })
  },
  markNotificationRead(id, token) {
    return request(`/api/job/notifications/${id}/read`, { method: 'PUT', token })
  },
}

export const adminEmploymentApi = {
  fairs(token) {
    return request('/api/admin/employment/fairs', { token })
  },
  createFair(payload, token) {
    return request('/api/admin/employment/fairs', { method: 'POST', body: payload, token })
  },
  updateFair(id, payload, token) {
    return request(`/api/admin/employment/fairs/${id}`, { method: 'PUT', body: payload, token })
  },
  deleteFair(id, token) {
    return request(`/api/admin/employment/fairs/${id}`, { method: 'DELETE', token })
  },
  jobs(token) {
    return request('/api/admin/employment/jobs', { token })
  },
  createJob(payload, token) {
    return request('/api/admin/employment/jobs', { method: 'POST', body: payload, token })
  },
  updateJob(id, payload, token) {
    return request(`/api/admin/employment/jobs/${id}`, { method: 'PUT', body: payload, token })
  },
  deleteJob(id, token) {
    return request(`/api/admin/employment/jobs/${id}`, { method: 'DELETE', token })
  },
  triggerNotification(payload, token) {
    return request('/api/admin/employment/notifications/trigger', { method: 'POST', body: payload, token })
  },
}

export const userApi = {
  profile(token) {
    return request('/api/users/me/profile', { token })
  },
  dashboard(token) {
    return request('/api/users/me/dashboard', { token })
  },
  updateProfile(payload, token) {
    return request('/api/users/me/profile', { method: 'PUT', body: payload, token })
  },
  myPosts(page, size, token) {
    return request(`/api/users/me/posts?page=${page}&size=${size}`, { token })
  },
  myPostDetail(id, token) {
    return request(`/api/users/me/posts/${id}`, { token })
  },
  updateMyPost(id, payload, token) {
    return request(`/api/users/me/posts/${id}`, { method: 'PUT', body: payload, token })
  },
  deleteMyPost(id, token) {
    return request(`/api/users/me/posts/${id}`, { method: 'DELETE', token })
  },
  myComments(page, size, token) {
    return request(`/api/users/me/comments?page=${page}&size=${size}`, { token })
  },
  deleteMyComment(id, token) {
    return request(`/api/users/me/comments/${id}`, { method: 'DELETE', token })
  },
  myAttempts(page, size, filters = {}, token) {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (typeof filters.correct === 'boolean') params.set('correct', String(filters.correct))
    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    return request(`/api/users/me/attempts?${params}`, { token })
  },
}

export const kaogongApi = {
  matchJobs(payload, token) {
    return request('/api/kaogong/jobs/match', { method: 'POST', body: payload, token })
  },
  jobsPage(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/jobs/page?${search.toString()}`)
  },
  jobs(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    const query = search.toString()
    return request(`/api/kaogong/jobs${query ? `?${query}` : ''}`)
  },
  favoriteJob(id, token) {
    return request(`/api/kaogong/jobs/${id}/favorite`, { method: 'POST', token })
  },
  unfavoriteJob(id, token) {
    return request(`/api/kaogong/jobs/${id}/favorite`, { method: 'DELETE', token })
  },
  favoriteJobs(token) {
    return request('/api/kaogong/jobs/favorites', { token })
  },
  jobMatchHistory(token) {
    return request('/api/kaogong/jobs/match-history', { token })
  },
  scoreLines(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    const query = search.toString()
    return request(`/api/kaogong/score-lines${query ? `?${query}` : ''}`)
  },
  scoreLinesPage(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/score-lines/page?${search.toString()}`)
  },
  favoriteScoreLine(id, token) {
    return request(`/api/kaogong/score-lines/${id}/favorite`, { method: 'POST', token })
  },
  unfavoriteScoreLine(id, token) {
    return request(`/api/kaogong/score-lines/${id}/favorite`, { method: 'DELETE', token })
  },
  favoriteScoreLines(token) {
    return request('/api/kaogong/score-lines/favorites', { token })
  },
  calendarEvents(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    const query = search.toString()
    return request(`/api/kaogong/calendar/events${query ? `?${query}` : ''}`)
  },
  calendarEventsPage(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/calendar/events/page?${search.toString()}`)
  },
  calendarExamGroupsPage(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/calendar/exams/page?${search.toString()}`)
  },
  subscribeCalendar(payload, token) {
    return request('/api/kaogong/calendar/subscriptions', { method: 'POST', body: payload, token })
  },
  mySubscriptions(token) {
    return request('/api/kaogong/calendar/subscriptions/me', { token })
  },
  cancelSubscription(id, token) {
    return request(`/api/kaogong/calendar/subscriptions/${id}/cancel`, { method: 'PUT', token })
  },
  notifications(token) {
    return request('/api/kaogong/notifications/me', { token })
  },
  interviewRooms() {
    return request('/api/kaogong/interviews')
  },
  interviewRoomsPage(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/interviews/page?${search.toString()}`)
  },
  myInterviewRooms(token) {
    return request('/api/kaogong/interviews/me', { token })
  },
  myInterviewRoomsPage(params = {}, token) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/interviews/me/page?${search.toString()}`, { token })
  },
  createInterviewRoom(payload, token) {
    return request('/api/kaogong/interviews', { method: 'POST', body: payload, token })
  },
  joinInterviewRoom(id, token) {
    return request(`/api/kaogong/interviews/${id}/join`, { method: 'POST', token })
  },
  updateInterviewRoomStatus(id, status, token) {
    return request(`/api/kaogong/interviews/${id}/status`, { method: 'PUT', body: { status }, token })
  },
  interviewMessages(id) {
    return request(`/api/kaogong/interviews/${id}/messages`)
  },
  interviewMessagesPage(id, params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/interviews/${id}/messages/page?${search.toString()}`)
  },
  sendInterviewMessage(id, payload, token) {
    return request(`/api/kaogong/interviews/${id}/messages`, { method: 'POST', body: payload, token })
  },
  interviewAttachments(id) {
    return request(`/api/kaogong/interviews/${id}/attachments`)
  },
  interviewAttachmentsPage(id, params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/interviews/${id}/attachments/page?${search.toString()}`)
  },
  async uploadInterviewAttachment(id, file, note, token, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    if (note) formData.append('note', note)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/api/kaogong/interviews/${id}/attachments`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && typeof onProgress === 'function') {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
      xhr.onload = () => {
        const data = (() => {
          try {
            return JSON.parse(xhr.responseText)
          } catch {
            return null
          }
        })()
        if (xhr.status < 200 || xhr.status >= 300 || !data?.success) {
          reject(new Error(data?.message || `Request failed: ${xhr.status}`))
          return
        }
        resolve(data.data)
      }
      xhr.onerror = () => reject(new Error('上传失败，请检查网络后重试'))
      xhr.onabort = () => reject(new Error('上传已取消'))
      xhr.send(formData)
    })
  },
  interviewRoomStreamUrl(id) {
    return `${API_BASE}/api/kaogong/interviews/${id}/stream`
  },
  attachmentDownloadUrl(attachmentId) {
    return `${API_BASE}/api/kaogong/interviews/attachments/${attachmentId}/download`
  },
  async downloadInterviewAttachment(attachmentId, token) {
    const response = await fetch(`${API_BASE}/api/kaogong/interviews/attachments/${attachmentId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message || `Request failed: ${response.status}`)
    }
    const blob = await response.blob()
    const disposition = response.headers.get('content-disposition') || ''
    const match = disposition.match(/filename\*=UTF-8''([^;]+)/)
    const fileName = match ? decodeURIComponent(match[1]) : `attachment-${attachmentId}`
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
  addInterviewFeedback(id, payload, token) {
    return request(`/api/kaogong/interviews/${id}/feedback`, { method: 'POST', body: payload, token })
  },
  interviewFeedback(id) {
    return request(`/api/kaogong/interviews/${id}/feedback`)
  },
  interviewFeedbackPage(id, params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/kaogong/interviews/${id}/feedback/page?${search.toString()}`)
  },
  myInterviewFeedback(token) {
    return request('/api/kaogong/interviews/feedback/me', { token })
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
  reports(status, page, size, token) {
    const q = status ? `?status=${status}&page=${page}&size=${size}` : `?page=${page}&size=${size}`
    return request(`/api/admin/reports${q}`, { token })
  },
  reviewReport(id, action, note, token) {
    return request(`/api/admin/reports/${id}/review`, {
      method: 'PUT',
      body: { action, note },
      token,
    })
  },
  kaogongJobs(params = {}, token) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/admin/kaogong/jobs?${search.toString()}`, { token })
  },
  createKaogongJob(payload, token) {
    return request('/api/admin/kaogong/jobs', { method: 'POST', body: payload, token })
  },
  updateKaogongJob(id, payload, token) {
    return request(`/api/admin/kaogong/jobs/${id}`, { method: 'PUT', body: payload, token })
  },
  deleteKaogongJob(id, token) {
    return request(`/api/admin/kaogong/jobs/${id}`, { method: 'DELETE', token })
  },
  kaogongScoreLines(params = {}, token) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/admin/kaogong/score-lines?${search.toString()}`, { token })
  },
  createKaogongScoreLine(payload, token) {
    return request('/api/admin/kaogong/score-lines', { method: 'POST', body: payload, token })
  },
  updateKaogongScoreLine(id, payload, token) {
    return request(`/api/admin/kaogong/score-lines/${id}`, { method: 'PUT', body: payload, token })
  },
  deleteKaogongScoreLine(id, token) {
    return request(`/api/admin/kaogong/score-lines/${id}`, { method: 'DELETE', token })
  },
  kaogongCalendarEvents(params = {}, token) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    return request(`/api/admin/kaogong/calendar-events?${search.toString()}`, { token })
  },
  createKaogongCalendarEvent(payload, token) {
    return request('/api/admin/kaogong/calendar-events', { method: 'POST', body: payload, token })
  },
  updateKaogongCalendarEvent(id, payload, token) {
    return request(`/api/admin/kaogong/calendar-events/${id}`, { method: 'PUT', body: payload, token })
  },
  deleteKaogongCalendarEvent(id, token) {
    return request(`/api/admin/kaogong/calendar-events/${id}`, { method: 'DELETE', token })
  },
}
