'use client'
import { useState } from 'react'

import Link from 'next/link'
import { UserPlus, TrendingUp, Eye, EyeOff, CheckCircle2, Clock } from 'lucide-react'
import { ContactAdminForm } from '@/components/ContactAdminForm'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordStrong = password.length >= 6

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Registrierung fehlgeschlagen.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Verbindungsfehler. Bitte nochmals versuchen.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all'
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }

  if (submitted) return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--accent)' }}
          >
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>HMS-Plattform</h1>
          <p className="text-slate-500 text-sm mt-1">HMS · Abschlussprüfung 2026</p>
        </div>

        <div className="rounded-2xl p-7 border text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}>
            <Clock size={26} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-2">Registrierung eingegangen</h2>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
            Dein Konto wird gerade vom Administrator geprüft. Du erhältst Zugang, sobald deine Anfrage bestätigt wurde — das dauert in der Regel nur kurze Zeit.
          </p>
          <div className="rounded-xl px-4 py-3 text-xs leading-relaxed mb-5"
            style={{ background: 'var(--icon-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            Du kannst diese Seite schliessen und dich später mit deinen Zugangsdaten anmelden.
          </div>
          <Link href="/login"
            className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', boxShadow: '0 2px 12px rgba(79,114,245,0.35)' }}>
            Zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
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
          <p className="text-slate-500 text-sm mt-1">HMS · Abschlussprüfung 2026</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">Konto erstellen</h2>
          <p className="text-xs text-slate-500 mb-5">Dein Fortschritt wird gespeichert und ist jederzeit abrufbar.</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Vollständiger Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="z. B. Anna Müller"
                required
                autoFocus
                minLength={2}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="anna@beispiel.ch"
                required
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
                  className={inputClass + ' pr-10'}
                  style={inputStyle}
                  placeholder="Mindestens 6 Zeichen"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrong ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all ${password.length >= 10 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span className={`text-[10px] ${passwordStrong ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {password.length < 6 ? 'Zu kurz' : password.length < 8 ? 'Akzeptabel' : password.length < 10 ? 'Gut' : 'Stark'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Passwort bestätigen
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={inputClass + ' pr-10'}
                  style={{
                    ...inputStyle,
                    borderColor: confirmPassword.length > 0
                      ? passwordsMatch ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                  placeholder="Passwort wiederholen"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {passwordsMatch && (
                  <CheckCircle2 size={14} className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-400 mr-1" />
                )}
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[10px] text-red-400 mt-1">Passwörter stimmen nicht überein.</p>
              )}
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 mt-2"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 2px 12px rgba(79,114,245,0.35)',
              }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              {loading ? 'Konto wird erstellt...' : 'Konto erstellen'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Anmelden
            </Link>
          </p>
          <ContactAdminForm />
        </div>
      </div>
    </div>
  )
}
