'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react'

export function ContactAdminForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
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

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors mx-auto"
      >
        {open ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
        Probleme bei der Anmeldung? Admin kontaktieren
      </button>

      {open && (
        <div className="mt-3 rounded-2xl p-5 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          {sent ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <CheckCircle2 size={22} className="text-emerald-400"/>
              <p className="text-sm font-semibold text-slate-200">Nachricht gesendet</p>
              <p className="text-xs text-slate-500">Der Administrator wurde benachrichtigt und meldet sich bei dir.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-slate-500 mb-1">Schreib dem Admin direkt — er antwortet so bald wie möglich.</p>
              <input
                type="text"
                placeholder="Dein Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Deine E-Mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
              />
              <textarea
                placeholder="Dein Problem oder deine Frage…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all resize-none"
                style={inputStyle}
              />
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
              >
                {loading
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  : <Send size={12}/>}
                {loading ? 'Wird gesendet…' : 'Nachricht senden'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
