'use client'
import { useAuth } from './AuthProvider'

export function AyriGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (!loading && user?.isAyri) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
        }}
      >
        <p
          style={{
            color: '#fff',
            fontSize: 'clamp(1.1rem, 4vw, 2rem)',
            fontWeight: 700,
            textAlign: 'center',
            padding: '0 2rem',
            letterSpacing: '-0.02em',
          }}
        >
          Du Ayri hesch wück denkt
        </p>
      </div>
    )
  }

  return <>{children}</>
}
