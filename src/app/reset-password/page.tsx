'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

function ResetForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Fehler.'); return }
      setDone(true)
      setTimeout(() => { window.location.href = '/login' }, 2500)
    } catch {
      setError('Verbindungsfehler.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="glass rounded-2xl p-6 border text-center space-y-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <p className="text-red-400 text-sm">Ungültiger Link.</p>
      <Link href="/forgot-password" className="text-blue-400 text-sm hover:text-blue-300">Neuen Link anfordern</Link>
    </div>
  )

  return (
    <div className="glass rounded-2xl p-6 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      {done ? (
        <div className="text-center space-y-3">
          <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
          <h2 className="text-base font-bold text-white">Passwort geändert!</h2>
          <p className="text-xs text-slate-400">Du wirst zum Login weitergeleitet…</p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">Neues Passwort</h2>
          <p className="text-xs text-slate-500 mb-5">Wähle ein sicheres neues Passwort.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Neues Passwort</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all pr-10"
                  style={inputStyle}
                  placeholder="Mindestens 6 Zeichen"
                  required
                  minLength={6}
                  autoFocus
                />
                <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Passwort bestätigen</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword.length > 0
                    ? confirmPassword === newPassword ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'
                    : 'rgba(255,255,255,0.1)',
                }}
                placeholder="Passwort wiederholen"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 20px -4px rgba(99,102,241,0.5)' }}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Wird gespeichert…' : 'Passwort speichern'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">HMS-Plattform</h1>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-6 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
