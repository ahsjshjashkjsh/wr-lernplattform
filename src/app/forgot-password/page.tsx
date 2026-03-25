'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Fehler beim Senden.'); return }
      setSent(true)
    } catch {
      setError('Verbindungsfehler. Bitte nochmals versuchen.')
    } finally {
      setLoading(false)
    }
  }

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

        <div className="glass rounded-2xl p-6 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <Mail size={22} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">E-Mail gesendet</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Falls ein Konto mit dieser E-Mail existiert, erhältst du in Kürze einen Link zum Zurücksetzen.
                </p>
              </div>
              <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium">
                <ArrowLeft size={13} /> Zurück zum Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-200 mb-1">Passwort vergessen?</h2>
              <p className="text-xs text-slate-500 mb-5">Gib deine E-Mail ein – wir senden dir einen Reset-Link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">E-Mail-Adresse</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    placeholder="anna@beispiel.ch"
                    required
                    autoFocus
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
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Mail size={14} />}
                  {loading ? 'Senden…' : 'Reset-Link senden'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 mt-5">
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1">
                  <ArrowLeft size={11} /> Zurück zum Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
