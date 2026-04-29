import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../lib/api.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'gp_token'
const DEV_USER_KEY = 'gp_dev_user'

const devUsers = {
  kaoyan: { id: 'dev-1', name: '考研测试用户', target: 'kaoyan', email: 'kaoyan@test.local', role: 'user', status: 'normal' },
  kaogong: { id: 'dev-2', name: '考公测试用户', target: 'kaogong', email: 'kaogong@test.local', role: 'user', status: 'normal' },
  job: { id: 'dev-3', name: '就业测试用户', target: 'job', email: 'job@test.local', role: 'user', status: 'normal' },
  liuxue: { id: 'dev-4', name: '留学测试用户', target: 'liuxue', email: 'liuxue@test.local', role: 'user', status: 'normal' },
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function init() {
      // 开发模式：通过 localStorage 设置模拟用户，无需后端
      const devTarget = localStorage.getItem(DEV_USER_KEY)
      if (devTarget && devUsers[devTarget]) {
        const devUser = devUsers[devTarget]
        if (active) {
          setToken('dev-token')
          setUser(devUser)
          setLoading(false)
        }
        return
      }

      if (!token) {
        setLoading(false)
        return
      }
      try {
        const me = await authApi.me(token)
        if (active) {
          setUser(me)
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        if (active) {
          setToken('')
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      active = false
    }
  }, [token])

  function switchDevUser(target) {
    if (!target) {
      localStorage.removeItem(DEV_USER_KEY)
      setToken('')
      setUser(null)
      return
    }
    const devUser = devUsers[target]
    if (devUser) {
      localStorage.setItem(DEV_USER_KEY, target)
      setToken('dev-token')
      setUser(devUser)
    }
  }

  async function login(payload) {
    const auth = await authApi.login(payload)
    localStorage.setItem(TOKEN_KEY, auth.token)
    setToken(auth.token)
    setUser(auth)
    return auth
  }

  async function register(payload) {
    const auth = await authApi.register(payload)
    localStorage.setItem(TOKEN_KEY, auth.token)
    setToken(auth.token)
    setUser(auth)
    return auth
  }

  async function logout() {
    try {
      if (token && token !== 'dev-token') {
        await authApi.logout(token)
      }
    } catch {
      // ignore network/logout failures for local session cleanup
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(DEV_USER_KEY)
    setToken('')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthed: Boolean(token && user),
        login,
        register,
        logout,
        switchDevUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
