'use client'
import { useState } from 'react'
import { MessageSquarePlus, Send, CheckCircle2, Lightbulb, Bug, FileText, HelpCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'bug',     label: 'Fehler',     icon: Bug,             color: '#f87171' },
  { value: 'feature', label: 'Vorschlag',  icon: Lightbulb,       color: '#fbbf24' },
  { value: 'content', label: 'Inhalt',     icon: FileText,        color: '#60a5fa' },
  { value: 'general', label: 'Allgemein',  icon: HelpCircle,      color: '#a78bfa' },
]

export default function FeedbackPage() {
  const [form, setForm] = useState({ title: '', message: '', category: 'general' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  }

  async function submit() {
    if (!form.title.trim() || !form.message.trim()) {
      setError('Bitte Titel und Nachricht ausfüllen.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Fehler beim Senden.')
      } else {
        setSuccess(true)
        setForm({ title: '', message: '', category: 'general' })
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuche es nochmals.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center fade-in">
        <div className="glass rounded-2xl p-10">
          <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Feedback gesendet!</h2>
          <p className="text-sm text-slate-400 mb-6">Danke für dein Feedback. Es wird vom Admin geprüft.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSuccess(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--accent)' }}
            >
              Weiteres Feedback senden
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <MessageSquarePlus size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Feedback</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Hast du einen Fehler gefunden oder einen Verbesserungsvorschlag? Schreib uns!
        </p>
      </div>

      <div className="glass rounded-2xl border p-6 space-y-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {/* Category */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">Kategorie</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              const active = form.category === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border"
                  style={{
                    background: active ? `${cat.color}18` : 'rgba(255,255,255,0.03)',
                    borderColor: active ? `${cat.color}50` : 'rgba(255,255,255,0.07)',
                    color: active ? cat.color : '#64748b',
                  }}
                >
                  <Icon size={15} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5">Titel</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Kurze Beschreibung..."
            maxLength={100}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-500/40"
            style={inputStyle}
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5">Nachricht</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Beschreibe das Problem oder den Vorschlag so genau wie möglich..."
            rows={5}
            maxLength={2000}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
            style={inputStyle}
          />
          <div className="text-right text-xs text-slate-600 mt-1">{form.message.length}/2000</div>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Send size={14} />
          {loading ? 'Wird gesendet...' : 'Feedback senden'}
        </button>
      </div>
    </div>
  )
}
