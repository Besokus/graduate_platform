import { useAuth } from '../context/AuthContext.jsx'

const targets = [
  { key: 'kaoyan', label: '考研' },
  { key: 'kaogong', label: '考公' },
  { key: 'job', label: '就业' },
  { key: 'liuxue', label: '留学' },
]

export default function DevBar() {
  const { isAuthed, user, switchDevUser } = useAuth()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: '#0d1b1a',
      color: '#f0fdfa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: '8px 16px',
      fontSize: 13,
      flexWrap: 'wrap',
    }}>
      <span style={{ opacity: 0.6 }}>DEV</span>
      {targets.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => switchDevUser(t.key)}
          style={{
            border: 'none',
            borderRadius: 999,
            padding: '4px 12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            fontFamily: 'inherit',
            background: user?.target === t.key ? '#0f766e' : 'rgba(255,255,255,0.15)',
            color: '#f0fdfa',
          }}
        >
          {t.label}
        </button>
      ))}
      {isAuthed && (
        <button
          type="button"
          onClick={() => switchDevUser(null)}
          style={{
            border: 'none',
            borderRadius: 999,
            padding: '4px 12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            fontFamily: 'inherit',
            background: 'rgba(239,68,68,0.5)',
            color: '#f0fdfa',
          }}
        >
          退出
        </button>
      )}
      <span style={{ opacity: 0.5, marginLeft: 8 }}>
        {isAuthed ? `当前: ${user?.name} (${user?.target})` : '未登录（游客模式）'}
      </span>
    </div>
  )
}
