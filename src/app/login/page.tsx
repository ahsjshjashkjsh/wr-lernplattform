'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, TrendingUp, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'BANNED') {
          window.location.href = '/banned'
          return
        }
setError(data.error ?? 'Anmeldung fehlgeschlagen.')
        return
      }
      const next = searchParams.get('next') ?? '/'
      window.location.href = next
    } catch {
      setError('Verbindungsfehler. Bitte nochmals versuchen.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="glass rounded-2xl p-6 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Willkommen zurück</h2>
      <p className="text-xs text-slate-500 mb-5">Melde dich an, um deinen Fortschritt fortzusetzen.</p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            placeholder="anna@beispiel.ch"
            required
            autoFocus
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">
            Passwort
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all pr-10"
              style={inputStyle}
              placeholder="Dein Passwort"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 4px 20px -4px rgba(99,102,241,0.5)',
          }}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn size={14} />
          )}
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>

      <div className="flex flex-col items-center gap-2 mt-5">
        <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Passwort vergessen?
        </Link>
        <p className="text-xs text-slate-500">
          Noch kein Konto?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            }}
          >
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">HMS-Plattform</h1>
          <p className="text-slate-500 text-sm mt-1">HMS · Abschlussprüfung 2026</p>
        </div>

        <Suspense fallback={<div className="glass rounded-2xl p-6 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
