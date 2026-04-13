'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { CARDS as STATIC_CARDS } from '@/data/buchungstrainer-cards'
import {
  Star, List, LayoutGrid, ChevronLeft, ChevronRight,
  Shuffle, RotateCcw, Eye, EyeOff, PenLine,
  CheckCircle2, XCircle, Lightbulb, Trophy, History, PlayCircle, AlertCircle, Trash2,
} from 'lucide-react'

const LS_KEY          = 'buchungstrainer-stars'
const LS_HISTORY_KEY  = 'buchungstrainer-history'
const MAX_HISTORY     = 15

type SessionRecord = {
  id: string
  startedAt: number
  completedAt?: number
  totalCards: number
  cardsDone: number
  score: { ok: number; fail: number }
  wrongIndices: number[]   // indices into allCards
  order: number[]
  filter: Filter
  shuffled: boolean
  isComplete: boolean
}

function loadHistory(): SessionRecord[] {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY_KEY) ?? '[]') } catch { return [] }
}
function saveHistory(h: SessionRecord[]) {
  try { localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(h.slice(0, MAX_HISTORY))) } catch {}
}
function upsertHistory(rec: SessionRecord) {
  const h = loadHistory()
  const idx = h.findIndex(r => r.id === rec.id)
  if (idx >= 0) h[idx] = rec; else h.unshift(rec)
  saveHistory(h)
}

// Custom cards from DB use negative IDs (-(id)) to avoid collision with static IDs
type Card = { id: number; q: string; a: string }
type Alias = { cardId: number; isCustom: boolean; answer: string }

function loadStars(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')) }
  catch { return new Set() }
}
function saveStars(s: Set<number>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...s]))
}
function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function norm(s: string) {
  return s.toLowerCase().trim().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').replace(/\.$/, '')
}
function checkAnswerWithAliases(input: string, card: Card, aliases: Alias[]): boolean {
  const ni = norm(input)
  if (ni === norm(card.a)) return true
  const isCustom = card.id < 0
  const realId = isCustom ? -(card.id) : card.id
  return aliases
    .filter(a => a.cardId === realId && a.isCustom === isCustom)
    .some(a => ni === norm(a.answer))
}
function buildHint(answer: string) {
  return answer.split('/').map(p => p.trim().charAt(0).toUpperCase() + '…').join(' / ')
}

type View   = 'list' | 'cards' | 'practice' | 'sessions'
type Filter = 'all'  | 'starred'
type Phase  = 'input' | 'correct' | 'wrong' | 'overridden'

export default function BuchungstrainerPage() {
  // ── DB data ────────────────────────────────────────────────────
  const [aliases,     setAliases]     = useState<Alias[]>([])
  const [allCards,    setAllCards]    = useState<Card[]>(STATIC_CARDS)

  // ── state ──────────────────────────────────────────────────────
  const [stars,       setStars]       = useState<Set<number>>(new Set())
  const [view,        setView]        = useState<View>('list')
  const [filter,      setFilter]      = useState<Filter>('all')
  const [order,       setOrder]       = useState<number[]>(() => STATIC_CARDS.map((_, i) => i))
  const [cardIndex,   setCardIndex]   = useState(0)
  const [shuffled,    setShuffled]    = useState(false)
  const [flipped,     setFlipped]     = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [phase,       setPhase]       = useState<Phase>('input')
  const [inputValue,  setInputValue]  = useState('')
  const [hint,        setHint]        = useState(false)
  const [score,       setScore]       = useState({ ok: 0, fail: 0 })
  const [wrongCards,  setWrongCards]  = useState<number[]>([]) // indices into allCards

  const [history,      setHistory]      = useState<SessionRecord[]>([])
  const [userId,       setUserId]       = useState<string | null>(null)
  const currentSessionId = useRef<string | null>(null)

  const inputRef        = useRef<HTMLInputElement>(null)
  const justSubmitted   = useRef(false)

  // ── load stars + DB data ───────────────────────────────────────
  useEffect(() => {
    setStars(loadStars())
    // Lade userId — wenn eingeloggt → History aus DB, sonst localStorage
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user?.id) {
        setUserId(d.user.id)
        fetch('/api/buchungstrainer/sessions').then(r => r.json()).then(sd => {
          setHistory(sd.sessions ?? [])
        }).catch(() => setHistory(loadHistory()))
      } else {
        setHistory(loadHistory())
      }
    }).catch(() => setHistory(loadHistory()))
    Promise.all([
      fetch('/api/buchungstrainer/aliases').then(r => r.ok ? r.json() : { aliases: [] }),
      fetch('/api/buchungstrainer/custom-cards').then(r => r.ok ? r.json() : { cards: [] }),
      fetch('/api/buchungstrainer/overrides').then(r => r.ok ? r.json() : { overrides: [] }),
    ]).then(([aliasData, cardData, overrideData]) => {
      if (aliasData.aliases) setAliases(aliasData.aliases)

      // Apply overrides to static cards
      const overrideMap = new Map(
        (overrideData.overrides ?? []).map((o: { staticId: number; question: string | null; answer: string | null }) =>
          [o.staticId, o]
        )
      )
      const staticCards: Card[] = STATIC_CARDS.map(card => {
        const ov = overrideMap.get(card.id) as { question: string | null; answer: string | null } | undefined
        return { id: card.id, q: ov?.question ?? card.q, a: ov?.answer ?? card.a }
      })

      const customCards: Card[] = (cardData.cards as { id: number; question: string; answer: string; isActive: boolean }[])
        .filter(c => c.isActive)
        .map(c => ({ id: -(c.id), q: c.question, a: c.answer }))

      const merged = [...staticCards, ...customCards]
      setAllCards(merged)
      setOrder(merged.map((_, i) => i))
    }).catch(() => {})
  }, [])

  // ── derived ────────────────────────────────────────────────────
  const visibleOrder = useMemo(() => (
    filter === 'starred' ? order.filter(i => stars.has(allCards[i]?.id ?? -999)) : order
  ), [order, filter, stars, allCards])

  const currentCard    = allCards[visibleOrder[cardIndex] ?? 0]
  const isLast         = cardIndex === visibleOrder.length - 1
  const starCount      = stars.size
  const totalAnswered  = score.ok + score.fail

  // ── callbacks ──────────────────────────────────────────────────
  const toggleStar = useCallback((id: number) => {
    setStars(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveStars(next)
      return next
    })
  }, [])

  const resetPractice = useCallback(() => {
    setPhase('input')
    setInputValue('')
    setHint(false)
  }, [])

  const goNext = useCallback(() => {
    setFlipped(false)
    setPhase('input')
    setInputValue('')
    setHint(false)
    setCardIndex(i => Math.min(i + 1, visibleOrder.length - 1))
  }, [visibleOrder.length])

  const goPrev = useCallback(() => {
    setFlipped(false)
    setPhase('input')
    setInputValue('')
    setHint(false)
    setCardIndex(i => Math.max(i - 1, 0))
  }, [])

  const doShuffle = useCallback(() => {
    setOrder(prev => shuffleArr(prev))
    setCardIndex(0)
    setFlipped(false)
    setPhase('input')
    setInputValue('')
    setHint(false)
    setShuffled(true)
  }, [])

  const doReset = useCallback(() => {
    currentSessionId.current = Date.now().toString()
    setOrder(allCards.map((_, i) => i))
    setCardIndex(0)
    setFlipped(false)
    setPhase('input')
    setInputValue('')
    setHint(false)
    setShuffled(false)
    setScore({ ok: 0, fail: 0 })
    setWrongCards([])
  }, [allCards])

  const handleOverride = useCallback(() => {
    setScore(s => ({ ok: s.ok + 1, fail: Math.max(s.fail - 1, 0) }))
    setWrongCards(prev => prev.filter(i => i !== visibleOrder[cardIndex]))
    setPhase('overridden')
  }, [visibleOrder, cardIndex])

  // ── keyboard: flashcards ───────────────────────────────────────
  useEffect(() => {
    if (view !== 'cards') return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [view, goNext, goPrev])

  // ── keyboard: practice ─────────────────────────────────────────
  // Re-registers whenever phase/isLast/goNext/handleOverride change
  // so the handler always sees fresh values — no stale closures.
  useEffect(() => {
    if (view !== 'practice') return
    const h = (e: KeyboardEvent) => {
      // Enter after answering → next card
      // justSubmitted guard: ignore the very Enter that triggered the submit
      if (e.key === 'Enter' && phase !== 'input') {
        if (justSubmitted.current) return
        e.preventDefault()
        if (!isLast) goNext()
        return
      }
      // K → "Ich hatte recht"
      if ((e.key === 'k' || e.key === 'K') && phase === 'wrong') {
        e.preventDefault()
        handleOverride()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [view, phase, isLast, goNext, handleOverride])

  // ── auto-focus input ───────────────────────────────────────────
  useEffect(() => {
    if (view === 'practice' && phase === 'input')
      setTimeout(() => inputRef.current?.focus(), 50)
  }, [view, phase, cardIndex])

  // ── reset practice on filter change ───────────────────────────
  useEffect(() => { resetPractice() }, [filter, resetPractice])

  // ── Session abschliessen wenn fertig ──────────────────────────
  const sessionMarked = useRef(false)
  useEffect(() => {
    if (view === 'practice' && isLast && phase !== 'input' && totalAnswered > 0) {
      if (!sessionMarked.current) {
        sessionMarked.current = true
        markSessionComplete()
      }
    } else {
      sessionMarked.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, isLast, phase, totalAnswered])

  // ── Session speichern (Practice-Modus) ────────────────────────
  useEffect(() => {
    if (view !== 'practice') return
    if (cardIndex === 0 && score.ok === 0 && score.fail === 0) return
    const sid = currentSessionId.current
    if (!sid) return
    const rec: SessionRecord = {
      id: sid,
      startedAt: parseInt(sid),
      totalCards: visibleOrder.length,
      cardsDone: cardIndex + 1,
      score,
      wrongIndices: wrongCards,
      order: visibleOrder,   // exakte Karten dieser Session einfrieren
      filter: 'all',         // kein Filter beim Wiederherstellen nötig
      shuffled,
      isComplete: false,
    }
    if (userId) {
      fetch('/api/buchungstrainer/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rec),
      }).catch(() => {})
    } else {
      upsertHistory(rec)
      setHistory(loadHistory())
    }
  }, [cardIndex, score, visibleOrder, filter, shuffled, view, wrongCards, userId])

  // ── practice: submit ───────────────────────────────────────────
  function handleSubmit() {
    if (phase !== 'input' || !inputValue.trim()) return
    const ok = checkAnswerWithAliases(inputValue, currentCard, aliases)
    setScore(s => ({ ok: s.ok + (ok ? 1 : 0), fail: s.fail + (ok ? 0 : 1) }))
    if (!ok) setWrongCards(prev => prev.includes(visibleOrder[cardIndex]) ? prev : [...prev, visibleOrder[cardIndex]])
    setPhase(ok ? 'correct' : 'wrong')
    justSubmitted.current = true
    setTimeout(() => { justSubmitted.current = false }, 400)
  }

  // Enter with empty input → show answer as wrong (skip/reveal)
  function handleEnterKey() {
    if (phase !== 'input') return
    if (!inputValue.trim()) {
      setScore(s => ({ ...s, fail: s.fail + 1 }))
      if (!wrongCards.includes(visibleOrder[cardIndex]))
        setWrongCards(prev => [...prev, visibleOrder[cardIndex]])
      setPhase('wrong')
      justSubmitted.current = true
      setTimeout(() => { justSubmitted.current = false }, 400)
      return
    }
    handleSubmit()
  }

  function repeatWrong() {
    // Session-ID bleibt gleich — gleiche Session bis 100%
    setOrder(shuffleArr(wrongCards))
    setFilter('all')
    setWrongCards([])
    setCardIndex(0)
    setScore({ ok: 0, fail: 0 })
    setPhase('input')
    setInputValue('')
    setHint(false)
    setFlipped(false)
  }

  // ── styling helpers ────────────────────────────────────────────
  const inputBorderColor =
    phase === 'input'                               ? 'var(--border-color)'
    : phase === 'correct' || phase === 'overridden' ? 'rgba(34,197,94,0.5)'
    : 'rgba(239,68,68,0.5)'

  const inputTextColor =
    phase === 'input'                               ? 'var(--text-primary)'
    : phase === 'correct' || phase === 'overridden' ? '#4ade80'
    : '#f87171'

  function markSessionComplete() {
    if (!currentSessionId.current) return
    const sid = currentSessionId.current
    const completedAt = Date.now()
    if (userId) {
      fetch('/api/buchungstrainer/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sid,
          startedAt: parseInt(sid),
          completedAt,
          totalCards: visibleOrder.length,
          cardsDone: visibleOrder.length,
          score,
          wrongIndices: wrongCards,
          order: visibleOrder,
          filter: 'all',
          shuffled,
          isComplete: wrongCards.length === 0,  // nur 100% = wirklich fertig
        }),
      }).then(() => {
        const done = wrongCards.length === 0
        setHistory(prev => prev.map(r => r.id === sid ? { ...r, isComplete: done, completedAt: done ? completedAt : undefined, wrongIndices: wrongCards } : r))
      }).catch(() => {})
    } else {
      const h = loadHistory()
      const idx = h.findIndex(r => r.id === sid)
      if (idx >= 0) {
        const done = wrongCards.length === 0
        h[idx] = { ...h[idx], isComplete: done, completedAt: done ? completedAt : undefined, wrongIndices: wrongCards }
        saveHistory(h)
        setHistory([...h])
      }
    }
  }

  function startSessionFromHistory(rec: SessionRecord) {
    currentSessionId.current = rec.id
    setOrder(rec.order)
    setCardIndex(rec.cardsDone - 1)
    setFilter(rec.filter)
    setShuffled(rec.shuffled)
    setScore(rec.score)
    setWrongCards(rec.wrongIndices)
    setView('practice')
    setPhase('input')
    setInputValue('')
    setHint(false)
  }

  function repeatWrongFromHistory(rec: SessionRecord) {
    currentSessionId.current = Date.now().toString()
    setOrder(shuffleArr(rec.wrongIndices))
    setFilter('all')
    setWrongCards([])
    setCardIndex(0)
    setScore({ ok: 0, fail: 0 })
    setPhase('input')
    setInputValue('')
    setHint(false)
    setFlipped(false)
    setView('practice')
  }

  function deleteSession(id: string) {
    if (userId) {
      fetch(`/api/buchungstrainer/sessions?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
        .then(() => setHistory(prev => prev.filter(r => r.id !== id)))
        .catch(() => {})
    } else {
      const h = loadHistory().filter(r => r.id !== id)
      saveHistory(h)
      setHistory(h)
    }
  }

  function clearAllHistory() {
    if (userId) {
      fetch('/api/buchungstrainer/sessions?all=1', { method: 'DELETE' })
        .then(() => setHistory([]))
        .catch(() => {})
    } else {
      saveHistory([])
      setHistory([])
    }
  }

  return (
    <div className="space-y-6 fade-in">

      {/* Header */}
      <div className="pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Finanz- &amp; Rechnungswesen
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Buchungstrainer
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {allCards.length} Buchungssätze
          {starCount > 0 ? ` · ${starCount} markiert` : ' · Markiere was du noch nicht kannst'}
        </p>
      </div>

      {/* Controls */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap pb-1 sm:pb-0">

        {/* Filter */}
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'all',     label: `Alle (${allCards.length})` },
            { id: 'starred', label: `Markierte (${starCount})` },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === t.id
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-muted)' }}>
              {t.id === 'starred' && <Star size={11} className={filter === 'starred' ? 'fill-white' : ''} />}
              {t.label}
            </button>
          ))}
        </div>

        {/* View */}
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'list',     label: 'Liste',     Icon: List       },
            { id: 'cards',    label: 'Karten',    Icon: LayoutGrid },
            { id: 'practice', label: 'Practice',  Icon: PenLine    },
            { id: 'sessions', label: 'Sessions',  Icon: History    },
          ] as const).map(({ id, label, Icon }) => (
            <button key={id}
              onClick={() => {
                if (id === 'practice') {
                  doReset()
                  setView('practice')
                } else if (id === 'sessions') {
                  if (userId) {
                    fetch('/api/buchungstrainer/sessions').then(r => r.json()).then(d => setHistory(d.sessions ?? [])).catch(() => setHistory(loadHistory()))
                  } else {
                    setHistory(loadHistory())
                  }
                  setView('sessions')
                } else {
                  setView(id)
                }
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={view === id
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-muted)' }}>
              <Icon size={13} />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {view === 'list' && (
          <button onClick={() => setShowAnswers(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            {showAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
            <span className="hidden sm:inline">{showAnswers ? 'Ausblenden' : 'Antworten zeigen'}</span>
          </button>
        )}

        {(view === 'cards' || view === 'practice') && (
          <>
            <button onClick={doShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <Shuffle size={13} />
              <span className="hidden sm:inline">Mischen</span>
            </button>
            {(shuffled || totalAnswered > 0) && (
              <button onClick={doReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Neu starten</span>
              </button>
            )}
          </>
        )}
      </div>
      </div>

      {/* Empty starred */}
      {filter === 'starred' && starCount === 0 && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <Star size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Keine markierten Karten</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Klicke den Stern bei Karten die du noch nicht kannst.</p>
        </div>
      )}

      {/* ═══════════════════════ LIST ═══════════════════════════ */}
      {view === 'list' && (filter !== 'starred' || starCount > 0) && (
        <div className="space-y-2">
          {visibleOrder.map(idx => {
            const card = allCards[idx]
            const st = stars.has(card.id)
            return (
              <div key={card.id} className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid ${st ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}`,
                }}>
                <button onClick={() => toggleStar(card.id)}
                  className="shrink-0 mt-0.5 hover:scale-110 transition-transform">
                  <Star size={16} style={{ color: st ? '#fbbf24' : 'var(--text-muted)', fill: st ? '#fbbf24' : 'none' }} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{card.q}</p>
                  {showAnswers && (
                    <p className="text-sm mt-1.5 font-semibold font-mono" style={{ color: 'var(--accent)' }}>{card.a}</p>
                  )}
                </div>
                {!showAnswers && (
                  <span className="hidden sm:inline shrink-0 text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{card.a}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════ FLASHCARDS ═════════════════════ */}
      {view === 'cards' && visibleOrder.length > 0 && currentCard && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>
              {cardIndex + 1} / {visibleOrder.length}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ background: 'var(--accent)', width: `${((cardIndex + 1) / visibleOrder.length) * 100}%` }} />
            </div>
          </div>

          <div className="relative rounded-2xl cursor-pointer select-none active:scale-[0.99] transition-transform"
            style={{
              background: 'var(--card-bg)',
              border: `2px solid ${flipped ? 'var(--accent)' : 'var(--border-color)'}`,
              minHeight: 220,
            }}
            onClick={() => setFlipped(f => !f)}>
            <button className="absolute top-4 right-4 z-10 hover:scale-110 transition-transform"
              onClick={e => { e.stopPropagation(); toggleStar(currentCard.id) }}>
              <Star size={20} style={{
                color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)',
                fill:  stars.has(currentCard.id) ? '#fbbf24' : 'none',
              }} />
            </button>
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={flipped
                  ? { background: 'rgba(79,114,245,0.15)', color: 'var(--accent)' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                {flipped ? 'Buchungssatz' : 'Situation'}
              </span>
            </div>
            <div className="flex items-center justify-center px-8 pt-14 pb-10 min-h-[220px]">
              {!flipped
                ? <p className="text-center text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{currentCard.q}</p>
                : <p className="text-center text-xl sm:text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>{currentCard.a}</p>
              }
            </div>
            {!flipped && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                <span className="sm:hidden">Tippen</span>
                <span className="hidden sm:inline">Tippen · Leertaste</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button onClick={goPrev} disabled={cardIndex === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Zurück</span>
            </button>
            <button onClick={() => setFlipped(f => !f)}
              className="flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'white' }}>
              Umdrehen
            </button>
            <button onClick={goNext} disabled={cardIndex === visibleOrder.length - 1}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <span className="hidden sm:inline">Weiter</span>
              <ChevronRight size={16} />
            </button>
          </div>
          <p className="hidden sm:block text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            ← → Navigieren · Leertaste Umdrehen
          </p>
        </div>
      )}

      {/* ═══════════════════════ PRACTICE ═══════════════════════ */}
      {view === 'practice' && visibleOrder.length > 0 && currentCard && (
        <div className="max-w-lg mx-auto space-y-6">

          {/* Score row */}
          <div className="flex items-center justify-between text-sm font-semibold">
            <span style={{ color: 'var(--text-muted)' }}>{cardIndex + 1} / {visibleOrder.length}</span>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-green-400">{score.ok} <CheckCircle2 size={16} /></span>
              <span className="flex items-center gap-1.5 text-red-400">{score.fail} <XCircle size={16} /></span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ background: 'var(--accent)', width: `${((cardIndex + 1) / visibleOrder.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="text-center px-2 py-4">
            <p className="text-xl sm:text-2xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {currentCard.q}
            </p>
            {hint && phase === 'input' && (
              <p className="mt-3 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                Tipp: <span style={{ color: 'var(--accent)' }}>{buildHint(currentCard.a)}</span>
              </p>
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={inputValue}
            disabled={phase !== 'input'}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleEnterKey() }}
            placeholder="Buchungssatz eingeben…"
            className="w-full px-4 sm:px-5 py-4 rounded-2xl text-base font-mono text-center outline-none transition-all"
            style={{
              background: 'var(--card-bg)',
              border: `2px solid ${inputBorderColor}`,
              color: inputTextColor,
            }}
          />

          {/* Correct answer (when wrong) */}
          {phase === 'wrong' && (() => {
            const isCustomCard = currentCard.id < 0
            const realId = isCustomCard ? -(currentCard.id) : currentCard.id
            const cardAliases = aliases.filter(a => a.cardId === realId && a.isCustom === isCustomCard)
            return (
              <div className="text-center space-y-1">
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Richtige Antwort
                </p>
                <p className="text-lg font-bold font-mono" style={{ color: '#4ade80' }}>
                  {currentCard.a}
                </p>
                {cardAliases.length > 0 && (
                  <div className="pt-1 space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Auch akzeptiert</p>
                    {cardAliases.map(a => (
                      <p key={a.id} className="text-sm font-mono" style={{ color: '#86efac' }}>{a.answer}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Buttons */}
          {phase === 'input' ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => setHint(h => !h)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <Lightbulb size={14} />
                  <span className="hidden sm:inline">Tipp</span>
                </button>
                <button onClick={() => toggleStar(currentCard.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: stars.has(currentCard.id) ? 'rgba(245,158,11,0.1)' : 'var(--card-bg)',
                    border: `1px solid ${stars.has(currentCard.id) ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}`,
                    color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)',
                  }}>
                  <Star size={14} style={{ fill: stars.has(currentCard.id) ? '#fbbf24' : 'none' }} />
                  {stars.has(currentCard.id) ? 'Markiert' : 'Markieren'}
                </button>
              </div>
              <button onClick={handleSubmit} disabled={!inputValue.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: 'var(--accent)' }}>
                <CheckCircle2 size={16} /> Prüfen
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {phase === 'wrong' && (
                <button onClick={handleOverride}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}>
                  <CheckCircle2 size={15} />
                  Ich hatte recht
                  <span className="text-[11px] font-normal px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#86efac' }}>K</span>
                </button>
              )}
              {!isLast ? (
                <button onClick={goNext}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--accent)' }}>
                  Weiter <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={doReset}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--accent)' }}>
                  <RotateCcw size={14} /> Neu starten
                </button>
              )}
              <p className="hidden sm:block text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Enter = Weiter{phase === 'wrong' ? ' · K = Ich hatte recht' : ''}
              </p>
            </div>
          )}

          {cardIndex > 0 && phase === 'input' && (
            <div className="text-center">
              <button onClick={goPrev} className="flex items-center gap-1 mx-auto text-xs"
                style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={12} /> Vorherige
              </button>
            </div>
          )}
        </div>
      )}

      {/* Abschluss */}
      {view === 'practice' && isLast && phase !== 'input' && totalAnswered > 0 && (
        <div className="max-w-lg mx-auto rounded-2xl p-6 text-center"
          style={{
            background: wrongCards.length === 0 ? 'rgba(34,197,94,0.07)' : 'var(--card-bg)',
            border: `1px solid ${wrongCards.length === 0 ? 'rgba(34,197,94,0.25)' : 'var(--border-color)'}`,
          }}>
          {wrongCards.length === 0
            ? <Trophy size={32} className="mx-auto mb-3 text-amber-400" />
            : <XCircle size={32} className="mx-auto mb-3 text-red-400" />
          }
          <p className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {wrongCards.length === 0 ? '100% — Perfekt!' : 'Runde abgeschlossen'}
          </p>
          <div className="flex justify-center gap-8 mb-4 text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-green-400"><CheckCircle2 size={16} /> {score.ok} richtig</span>
            <span className="flex items-center gap-1.5 text-red-400"><XCircle size={16} /> {score.fail} falsch</span>
          </div>
          <p className="text-3xl font-extrabold mb-2" style={{ color: wrongCards.length === 0 ? '#4ade80' : 'var(--accent)' }}>
            {Math.round((score.ok / totalAnswered) * 100)}%
          </p>
          {wrongCards.length > 0 && (
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
              Wiederhole die Falschen bis du 100% erreichst
            </p>
          )}
          <div className="flex flex-col gap-2.5 items-center">
            {wrongCards.length > 0 && (
              <button onClick={repeatWrong}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
                <XCircle size={14} /> {wrongCards.length} Falsche wiederholen
              </button>
            )}
            <button onClick={() => { setFilter('all'); doReset() }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <RotateCcw size={14} /> Neue Session starten
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════ SESSIONS ══════════════════════ */}
      {view === 'sessions' && (
        <div className="space-y-3">
          {history.length > 0 && (
            <div className="flex justify-end">
              <button onClick={clearAllHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <Trash2 size={12} /> Alle löschen
              </button>
            </div>
          )}
          {history.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <History size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Noch keine Sessions</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Starte einen Practice-Durchgang um deine Sessions hier zu sehen.</p>
            </div>
          ) : history.map(rec => {
            const pct = rec.totalCards > 0 ? Math.round((rec.cardsDone / rec.totalCards) * 100) : 0
            const scorePct = (rec.score.ok + rec.score.fail) > 0 ? Math.round((rec.score.ok / (rec.score.ok + rec.score.fail)) * 100) : 0
            const date = new Date(rec.startedAt)
            const dateStr = date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: '2-digit' })
            const timeStr = date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
            return (
              <div key={rec.id} className="rounded-2xl p-4" style={{ background: 'var(--card-bg)', border: `1px solid ${rec.isComplete ? 'var(--border-color)' : 'rgba(99,102,241,0.3)'}` }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {/* Status badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {rec.isComplete ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ background: rec.wrongIndices.length === 0 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)', color: rec.wrongIndices.length === 0 ? '#4ade80' : '#fbbf24' }}>
                          {rec.wrongIndices.length === 0 ? <><CheckCircle2 size={10} /> 100%</> : <><AlertCircle size={10} /> {rec.wrongIndices.length} falsch</>}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                          <PlayCircle size={10} /> Nicht fertig
                        </span>
                      )}
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{dateStr} · {timeStr}</span>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: rec.isComplete ? '#4ade80' : 'var(--accent)' }} />
                      </div>
                      <span className="text-xs shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>{rec.cardsDone}/{rec.totalCards} Karten</span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={11} /> {rec.score.ok} richtig</span>
                      <span className="flex items-center gap-1 text-red-400"><XCircle size={11} /> {rec.score.fail} falsch</span>
                      {(rec.score.ok + rec.score.fail) > 0 && (
                        <span className="font-bold" style={{ color: scorePct >= 80 ? '#4ade80' : scorePct >= 50 ? '#fbbf24' : '#f87171' }}>{scorePct}%</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {!rec.isComplete && (
                      <button onClick={() => startSessionFromHistory(rec)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                        style={{ background: 'var(--accent)' }}>
                        <PlayCircle size={12} /> Weitermachen
                      </button>
                    )}
                    {rec.wrongIndices.length > 0 && (
                      <button onClick={() => repeatWrongFromHistory(rec)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                        <XCircle size={12} /> {rec.wrongIndices.length} Falsche üben
                      </button>
                    )}
                    <button onClick={() => deleteSession(rec.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <Trash2 size={12} /> Löschen
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
