'use client'
import { useEffect, useState } from 'react'
import { Crown, Smartphone, Copy, Check, Lock, BookOpen, Zap, Tag } from 'lucide-react'

const TWINT_NUMBER = process.env.NEXT_PUBLIC_TWINT_NUMBER ?? '079 XXX XX XX'
const PREMIUM_PRICE = process.env.NEXT_PUBLIC_PREMIUM_PRICE ?? '5'

type Status = 'loading' | 'unauthenticated' | 'active' | 'pending' | 'none'

interface PremiumState {
  status: Status
  premiumUntil: string | null
  code: string | null
}

export default function PremiumPage() {
  const [state, setState] = useState<PremiumState>({ status: 'loading', premiumUntil: null, code: null })
  const [requesting, setRequesting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // Rabattcode
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/premium/status')
      .then(r => r.json())
      .then(data => {
        if (data.status === 'unauthenticated') {
          setState({ status: 'unauthenticated', premiumUntil: null, code: null })
        } else if (data.isPremium) {
          setState({ status: 'active', premiumUntil: data.premiumUntil, code: null })
        } else if (data.pendingRequest) {
          setState({ status: 'pending', premiumUntil: null, code: data.pendingRequest.code })
        } else {
          setState({ status: 'none', premiumUntil: null, code: null })
        }
      })
      .catch(() => setState({ status: 'none', premiumUntil: null, code: null }))
  }, [])

  async function handleRequest() {
    setRequesting(true)
    setError('')
    const res = await fetch('/api/premium/request', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Fehler beim Erstellen der Anfrage.')
    } else {
      setState({ status: 'pending', premiumUntil: null, code: data.code })
    }
    setRequesting(false)
  }

  async function handlePromoRedeem() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    const res = await fetch('/api/premium/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setPromoError(data.error ?? 'Ungültiger Code.')
    } else {
      setPromoSuccess(true)
      setState({ status: 'active', premiumUntil: data.premiumUntil, code: null })
    }
    setPromoLoading(false)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Crown size={20} style={{ color: '#fbbf24' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Premium</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Abschlussprüfungs-Inhalte freischalten</p>
        </div>
      </div>

      {/* Was ist Premium */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Was du bekommst</h2>
        <ul className="space-y-2">
          {[
            { icon: BookOpen, text: 'Alle AP-Kapitel (Abschlussprüfung) in FRW' },
            { icon: Zap, text: 'Vollständiger Zugang zu allen Lernmaterialien' },
            { icon: Lock, text: '30 Tage Zugang ab Freischaltung' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Icon size={14} className="text-amber-400 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
        <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
          <span className="text-2xl font-bold text-amber-400">CHF {PREMIUM_PRICE}</span>
          <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>/ Monat</span>
        </div>
        {/* Umtriebskosten-Hinweis */}
        <p className="text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
          Die CHF {PREMIUM_PRICE} pro Monat dienen als Umtriebskosten und decken den Aufwand sowie die kontinuierliche Weiterentwicklung der Inhalte.
        </p>
      </div>

      {/* Rabattcode */}
      {(state.status === 'none' || state.status === 'pending') && !promoSuccess && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-400">Rabattcode einlösen</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Hast du einen Rabattcode? Gib ihn hier ein und erhalte 1 Monat kostenlos.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder="z. B. GRATIS-ABC123"
              className="flex-1 px-3 py-2 rounded-lg text-sm font-mono tracking-wider outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(52,211,153,0.3)',
                color: 'var(--text-primary)',
              }}
              onKeyDown={e => e.key === 'Enter' && handlePromoRedeem()}
            />
            <button
              onClick={handlePromoRedeem}
              disabled={promoLoading || !promoCode.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
            >
              {promoLoading ? '...' : 'Einlösen'}
            </button>
          </div>
          {promoError && (
            <p className="text-xs text-red-400 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)' }}>
              {promoError}
            </p>
          )}
        </div>
      )}

      {/* State-abhängiger Content */}
      {state.status === 'loading' && (
        <div className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Laden...</div>
      )}

      {state.status === 'unauthenticated' && (
        <div className="rounded-2xl p-5 text-center space-y-3"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Du musst angemeldet sein um Premium zu bestellen.
          </p>
          <a href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            Jetzt anmelden
          </a>
        </div>
      )}

      {state.status === 'active' && state.premiumUntil && (
        <div className="rounded-2xl p-5 text-center space-y-2"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Crown size={28} className="text-amber-400 mx-auto" />
          <p className="text-sm font-semibold text-amber-400">Premium aktiv</p>
          {promoSuccess && (
            <p className="text-xs text-emerald-400 font-medium">Rabattcode erfolgreich eingelöst!</p>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Gültig bis {new Date(state.premiumUntil).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      )}

      {state.status === 'pending' && state.code && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Anfrage erstellt — jetzt zahlen
          </h2>
          <ol className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold shrink-0">1</span>
              Öffne Twint und zahle <strong className="text-amber-400 mx-1">CHF {PREMIUM_PRICE}</strong> an:
              <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{TWINT_NUMBER}</span>
            </li>
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold shrink-0">2</span>
              Schreibe diesen Code ins <strong style={{ color: 'var(--text-primary)' }}>Mitteilungsfeld</strong>:
            </li>
          </ol>
          {/* Code Box */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)' }}>
            <span className="font-mono text-2xl font-bold tracking-widest text-amber-400 flex-1">
              {state.code}
            </span>
            <button
              onClick={() => copyCode(state.code!)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                color: copied ? '#4ade80' : '#fbbf24',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Kopiert' : 'Kopieren'}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Sobald die Zahlung bestätigt wurde, schalten wir deinen Zugang frei. Dies kann einige Stunden dauern.
          </p>
        </div>
      )}

      {state.status === 'none' && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Smartphone size={16} className="text-amber-400 shrink-0" />
            Zahlung per Twint — du erhältst einen Code den du im Mitteilungsfeld angibst.
          </div>
          {error && (
            <p className="text-xs text-red-400 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </p>
          )}
          <button
            onClick={handleRequest}
            disabled={requesting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: '#d97706' }}
          >
            <Crown size={15} />
            {requesting ? 'Wird erstellt...' : 'Jetzt anfragen — CHF ' + PREMIUM_PRICE + ' / Monat'}
          </button>
        </div>
      )}
    </div>
  )
}
