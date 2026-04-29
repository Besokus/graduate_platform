import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { userApi } from '../lib/api.js'
import '../App.css'

const statusLabelMap = {
  inactive: '未激活',
  normal: '正常',
  muted: '禁言',
  upload_limited: '限制上传',
  temporary_locked: '临时锁定',
  banned: '封禁',
  deleting: '注销申请中',
  deleted: '已注销',
}

const rolePermissions = {
  visitor: ['浏览首页公开内容', '查看公开帖子与公告', '按分类筛选公开信息'],
  user: [
    '社区发帖、评论、点赞、收藏、举报',
    '资料上传下载与分类检索',
    '题库练习、错题本、历史统计',
    '学习打卡、提醒订阅、投递跟踪',
  ],
  admin: [
    '审核帖子、评论、资料',
    '处理举报与违规账号',
    '维护题库、分数线、岗位信息',
    '维护分类、标签与提醒规则',
  ],
}

function ProfilePage() {
  const { token, user, isAuthed, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      if (!token) return
      try {
        const [profileData, dashboardData] = await Promise.all([
          userApi.profile(token),
          userApi.dashboard(token),
        ])
        if (active) {
          setProfile(profileData)
          setDashboard(dashboardData)
        }
      } catch (err) {
        if (active) {
          setError(err.message || '加载用户信息失败')
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [token])

  const normalizedRole = useMemo(() => {
    const role = (profile?.role || user?.role || 'user').toLowerCase()
    if (role.includes('admin')) return 'admin'
    if (role.includes('visitor')) return 'visitor'
    return 'user'
  }, [profile?.role, user?.role])

  const normalizedStatus = (profile?.status || user?.status || 'normal').toLowerCase()
  const securityInfo = profile?.security || {}

  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app">
      <Navbar />
      <main className="shell">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">用户中心</p>
            <h2>{profile?.name || user?.name} 的个人面板</h2>
            <p className="muted">{profile?.email || user?.email}</p>
          </div>
          {error ? <div className="error-text">{error}</div> : null}
          <div className="grid-two">
            <div className="feature-card">
              <div className="card-title">账号信息</div>
              <ul className="feature-list compact">
                <li>昵称：{profile?.name || user?.name || '未设置'}</li>
                <li>手机号：{profile?.phone || '未绑定'}</li>
                <li>邮箱：{profile?.email || user?.email || '未设置'}</li>
                <li>学校：{profile?.school || '未设置'}</li>
                <li>专业：{profile?.major || '未设置'}</li>
                <li>年级：{profile?.grade || '未设置'}</li>
                <li>目标方向：{profile?.target || user?.target || '未设置'}</li>
                <li>意向地区：{profile?.intentRegion || '未设置'}</li>
                <li>账号状态：{statusLabelMap[normalizedStatus] || normalizedStatus}</li>
              </ul>
              <button className="btn ghost" type="button" onClick={logout}>退出登录</button>
            </div>
            <div className="feature-card metrics">
              <div className="card-title">学习与互动统计</div>
              <div className="mini-grid">
                <div className="mini-card">
                  <div className="mini-value">{dashboard?.postCount ?? 0}</div>
                  <div className="mini-label">发帖数</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{dashboard?.commentCount ?? 0}</div>
                  <div className="mini-label">评论数</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{dashboard?.attemptCount ?? 0}</div>
                  <div className="mini-label">答题数</div>
                </div>
                <div className="mini-card">
                  <div className="mini-value">{dashboard?.checkinCount ?? 0}</div>
                  <div className="mini-label">打卡数</div>
                </div>
              </div>
              <div className="notice-box">
                <strong>访问角色：{normalizedRole}</strong>
                <p className="muted">权限由账号状态与角色共同控制。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="grid-two">
            <div className="feature-card soft">
              <div className="card-title">角色权限说明</div>
              <div className="permission-group">
                <div className="permission-title">游客权限</div>
                <ul className="feature-list compact">
                  {rolePermissions.visitor.map((item) => (
                    <li key={`visitor-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="permission-group">
                <div className="permission-title">注册用户权限</div>
                <ul className="feature-list compact">
                  {rolePermissions.user.map((item) => (
                    <li key={`user-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="permission-group">
                <div className="permission-title">管理员权限</div>
                <ul className="feature-list compact">
                  {rolePermissions.admin.map((item) => (
                    <li key={`admin-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="feature-card">
              <div className="card-title">账号安全记录</div>
              <ul className="feature-list compact">
                <li>最近登录时间：{securityInfo.lastLoginAt || profile?.lastLoginAt || '暂无记录'}</li>
                <li>最近登录设备：{securityInfo.lastDevice || profile?.lastDevice || '暂无记录'}</li>
                <li>最近登录地点：{securityInfo.lastLocation || profile?.lastLocation || '暂无记录'}</li>
                <li>最近登录 IP：{securityInfo.lastIp || profile?.lastIp || '暂无记录'}</li>
              </ul>
              <div className="notice-box">
                <strong>敏感操作二次校验</strong>
                <p className="muted">修改手机号、绑定邮箱、重置密码建议启用验证码确认。</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default ProfilePage

