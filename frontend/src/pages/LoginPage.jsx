import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../App.css'

const credentialTypeOptions = [
  { value: 'email', label: '邮箱登录' },
  { value: 'phone', label: '手机号登录' },
  { value: 'studentId', label: '学号登录' },
]

function validateCredential(type, value) {
  const trimmed = value.trim()
  if (!trimmed) return '请输入账号'

  if (type === 'email') {
    const matched = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    if (!matched) return '邮箱格式不正确'
  }
  if (type === 'phone') {
    const matched = /^1[3-9]\d{9}$/.test(trimmed)
    if (!matched) return '手机号格式不正确'
  }
  if (type === 'studentId') {
    const matched = /^[A-Za-z0-9_-]{6,20}$/.test(trimmed)
    if (!matched) return '学号格式不正确'
  }
  return ''
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    credentialType: 'email',
    credential: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const credentialError = validateCredential(form.credentialType, form.credential)
    if (credentialError) {
      setError(credentialError)
      return
    }
    if (!form.password.trim()) {
      setError('请输入密码')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        password: form.password,
        loginType: form.credentialType,
        credential: form.credential.trim(),
        email: form.credentialType === 'email' ? form.credential.trim() : form.credential.trim(),
        phone: form.credentialType === 'phone' ? form.credential.trim() : undefined,
        studentId: form.credentialType === 'studentId' ? form.credential.trim() : undefined,
      }
      await login(payload)
      navigate('/profile')
    } catch (err) {
      setError(err.message || '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  const placeholderMap = {
    email: '请输入邮箱账号',
    phone: '请输入手机号',
    studentId: '请输入学号',
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section auth-wrap">
          <div className="section-head">
            <p className="eyebrow">登录</p>
            <h2>统一认证入口</h2>
            <p className="muted">支持手机号 / 邮箱 / 学号登录，连续输错密码将触发临时锁定。</p>
          </div>
          <form className="auth-card" onSubmit={handleSubmit}>
            <label className="field">
              <span>登录方式</span>
              <select
                value={form.credentialType}
                onChange={(event) => setForm({ ...form, credentialType: event.target.value, credential: '' })}
              >
                {credentialTypeOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>账号</span>
              <input
                value={form.credential}
                onChange={(event) => setForm({ ...form, credential: event.target.value })}
                type="text"
                placeholder={placeholderMap[form.credentialType]}
                required
              />
            </label>
            <label className="field">
              <span>密码</span>
              <input
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                type="password"
                placeholder="请输入密码"
                required
              />
            </label>
            <div className="notice-box">
              <strong>安全提示</strong>
              <p className="muted">若账号被临时锁定，可通过验证码找回密码并重新登录。</p>
            </div>
            {error ? <div className="error-text">{error}</div> : null}
            <button className="btn primary" type="submit" disabled={submitting}>
              {submitting ? '登录中...' : '登录'}
            </button>
            <div className="muted auth-tip">
              还没有账号？<Link to="/register">去注册</Link>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default LoginPage

