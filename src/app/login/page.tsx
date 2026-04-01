'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, TrendingUp, Eye, EyeOff, Clock } from 'lucide-react'
import { ContactAdminForm } from '@/components/ContactAdminForm'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

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
        if (data.error === 'PENDING') {
          setPending(true)
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

  if (pending) return (
    <div className="rounded-2xl p-7 border text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}>
        <Clock size={26} style={{ color: 'var(--accent)' }} />
      </div>
      <h2 className="text-lg font-bold text-slate-100 mb-2">Zugang wird geprüft</h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Dein Konto wurde noch nicht freigeschaltet. Der Administrator prüft deine Anfrage und gibt deinen Zugang so bald wie möglich frei.
      </p>
    </div>
  )

  return (
    <div className="rounded-2xl p-6 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
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
            background: 'var(--accent)',
            boxShadow: '0 2px 12px rgba(79,114,245,0.35)',
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

      <p className="text-center text-xs text-slate-500 mt-5">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
          Jetzt registrieren
        </Link>
      </p>
      <ContactAdminForm />
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
            style={{ background: 'var(--accent)' }}
          >
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>HMS-Plattform</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>HMS · Abschlussprüfung 2026</p>
        </div>

        <Suspense fallback={<div className="rounded-2xl p-6 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', minHeight: '280px' }} />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
