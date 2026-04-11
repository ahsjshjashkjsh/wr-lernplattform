'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { CARDS } from '@/data/buchungstrainer-cards'
import {
  Star, List, LayoutGrid, ChevronLeft, ChevronRight,
  Shuffle, RotateCcw, Eye, EyeOff, CheckCircle2,
  XCircle, PenLine, Trophy, Check,
} from 'lucide-react'

const LS_KEY = 'buchungstrainer-stars'

function loadStars(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}
function saveStars(s: Set<number>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...s]))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Normalize: lowercase, trim, collapse spaces */
function normalize(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

type View   = 'list' | 'cards' | 'practice'
type Filter = 'all'  | 'starred'

type PracticeState =
  | { phase: 'input' }
  | { phase: 'result'; input: string; correct: boolean; overridden: boolean }

export default function BuchungstrainerPage() {
  const [stars,       setStars]       = useState<Set<number>>(new Set())
  const [view,        setView]        = useState<View>('list')
  const [filter,      setFilter]      = useState<Filter>('all')

  const [order,       setOrder]       = useState<number[]>(() => CARDS.map((_, i) => i))
  const [cardIndex,   setCardIndex]   = useState(0)
  const [shuffled,    setShuffled]    = useState(false)

  // Flashcard
  const [flipped,     setFlipped]     = useState(false)

  // List
  const [showAnswers, setShowAnswers] = useState(false)

  // Practice
  const [practice,    setPractice]    = useState<PracticeState>({ phase: 'input' })
  const [inputValue,  setInputValue]  = useState('')
  const [score,       setScore]       = useState({ correct: 0, wrong: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setStars(loadStars()) }, [])

  const toggleStar = useCallback((id: number) => {
    setStars(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveStars(next)
      return next
    })
  }, [])

  const visibleOrder = useMemo(() => {
    return filter === 'starred'
      ? order.filter(i => stars.has(CARDS[i].id))
      : order
  }, [order, filter, stars])

  const currentCard = CARDS[visibleOrder[cardIndex] ?? 0]

  const goNext = useCallback(() => {
    setFlipped(false)
    setPractice({ phase: 'input' })
    setInputValue('')
    setCardIndex(i => Math.min(i + 1, visibleOrder.length - 1))
  }, [visibleOrder.length])

  const goPrev = useCallback(() => {
    setFlipped(false)
    setPractice({ phase: 'input' })
    setInputValue('')
    setCardIndex(i => Math.max(i - 1, 0))
  }, [])

  const doShuffle = useCallback(() => {
    setOrder(prev => shuffle(prev))
    setCardIndex(0); setFlipped(false)
    setPractice({ phase: 'input' }); setInputValue('')
    setShuffled(true)
  }, [])

  const doReset = useCallback(() => {
    setOrder(CARDS.map((_, i) => i))
    setCardIndex(0); setFlipped(false)
    setPractice({ phase: 'input' }); setInputValue('')
    setShuffled(false); setScore({ correct: 0, wrong: 0 })
  }, [])

  // Keyboard nav (flashcard)
  useEffect(() => {
    if (view !== 'cards') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view, goNext, goPrev])

  // Focus input when switching to practice or moving to next card
  useEffect(() => {
    if (view === 'practice' && practice.phase === 'input') {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [view, practice.phase, cardIndex])

  // Reset on filter change
  useEffect(() => {
    setCardIndex(0); setFlipped(false)
    setPractice({ phase: 'input' }); setInputValue('')
  }, [filter])

  // ── Practice: submit answer ──────────────────────────────────
  function submitAnswer() {
    if (!inputValue.trim()) return
    const correct = normalize(inputValue) === normalize(currentCard.a)
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong:   s.wrong   + (correct ? 0 : 1),
    }))
    setPractice({ phase: 'result', input: inputValue, correct, overridden: false })
  }

  function handleOverride() {
    // "Ich hatte recht" — reclassify wrong as correct
    setScore(s => ({ correct: s.correct + 1, wrong: Math.max(s.wrong - 1, 0) }))
    setPractice(p => p.phase === 'result' ? { ...p, overridden: true, correct: true } : p)
  }

  const isLastCard  = cardIndex === visibleOrder.length - 1
  const starCount   = stars.size
  const totalAnswered = score.correct + score.wrong

  return (
    <div className="space-y-6 fade-in">

      {/* Header */}
      <div className="pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-3" style={{ color: 'var(--text-muted)' }}>
          Finanz- &amp; Rechnungswesen
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Buchungstrainer
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {CARDS.length} Buchungssätze
          {starCount > 0 ? ` · ${starCount} markiert` : ' · Markiere was du noch nicht kannst'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'all',     label: `Alle (${CARDS.length})` },
            { id: 'starred', label: `Markierte (${starCount})` },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === tab.id ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-muted)' }}>
              {tab.id === 'starred' && <Star size={11} className={filter === 'starred' ? 'fill-white' : ''} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'list',     label: 'Liste',        Icon: List       },
            { id: 'cards',    label: 'Karteikarten', Icon: LayoutGrid },
            { id: 'practice', label: 'Practice',     Icon: PenLine    },
          ] as const).map(({ id, label, Icon }) => (
            <button key={id}
              onClick={() => { setView(id); if (id === 'practice') { doReset() } }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={view === id ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-muted)' }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* List extras */}
        {view === 'list' && (
          <button onClick={() => setShowAnswers(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            {showAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
            {showAnswers ? 'Antworten ausblenden' : 'Antworten zeigen'}
          </button>
        )}

        {/* Shuffle / Reset */}
        {(view === 'cards' || view === 'practice') && (
          <>
            <button onClick={doShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <Shuffle size={13} /> Mischen
            </button>
            {(shuffled || totalAnswered > 0) && (
              <button onClick={doReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <RotateCcw size={13} /> Neu starten
              </button>
            )}
          </>
        )}
      </div>

      {/* Empty state */}
      {filter === 'starred' && starCount === 0 && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <Star size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Keine markierten Karten</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Klicke den Stern bei Karten, die du noch nicht kannst.</p>
        </div>
      )}

      {/* ── LIST ──────────────────────────────────────────────── */}
      {view === 'list' && (filter !== 'starred' || starCount > 0) && (
        <div className="space-y-2">
          {visibleOrder.map(idx => {
            const card = CARDS[idx]
            const isStarred = stars.has(card.id)
            return (
              <div key={card.id}
                className="rounded-xl px-4 py-3.5 flex items-start gap-3 transition-all"
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid ${isStarred ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}`,
                }}>
                <button onClick={() => toggleStar(card.id)}
                  className="shrink-0 mt-0.5 transition-all hover:scale-110 active:scale-95">
                  <Star size={16} style={{ color: isStarred ? '#fbbf24' : 'var(--text-muted)', fill: isStarred ? '#fbbf24' : 'none' }} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{card.q}</p>
                  {showAnswers && (
                    <p className="text-sm mt-1.5 font-semibold font-mono" style={{ color: 'var(--accent)' }}>{card.a}</p>
                  )}
                </div>
                {!showAnswers && (
                  <span className="shrink-0 text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{card.a}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── FLASHCARDS ────────────────────────────────────────── */}
      {view === 'cards' && visibleOrder.length > 0 && currentCard && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs w-12 shrink-0" style={{ color: 'var(--text-muted)' }}>
              {cardIndex + 1} / {visibleOrder.length}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ background: 'var(--accent)', width: `${((cardIndex + 1) / visibleOrder.length) * 100}%` }} />
            </div>
            <span className="text-xs font-medium w-8 text-right shrink-0" style={{ color: 'var(--accent)' }}>
              {Math.round(((cardIndex + 1) / visibleOrder.length) * 100)}%
            </span>
          </div>

          <div className="relative rounded-2xl cursor-pointer select-none transition-all duration-150 active:scale-[0.99]"
            style={{ background: 'var(--card-bg)', border: `2px solid ${flipped ? 'var(--accent)' : 'var(--border-color)'}`, minHeight: '220px' }}
            onClick={() => setFlipped(f => !f)}>
            <button className="absolute top-4 right-4 z-10 transition-all hover:scale-110 active:scale-95"
              onClick={e => { e.stopPropagation(); toggleStar(currentCard.id) }}>
              <Star size={20} style={{ color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)', fill: stars.has(currentCard.id) ? '#fbbf24' : 'none' }} />
            </button>
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={flipped ? { background: 'rgba(79,114,245,0.15)', color: 'var(--accent)' } : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                {flipped ? 'Buchungssatz' : 'Situation'}
              </span>
            </div>
            <div className="flex items-center justify-center px-8 pt-14 pb-10 min-h-[220px]">
              <div className="text-center">
                {!flipped
                  ? <p className="text-base sm:text-lg font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>{currentCard.q}</p>
                  : <p className="text-xl sm:text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--accent)' }}>{currentCard.a}</p>
                }
              </div>
            </div>
            {!flipped && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Tippen zum Umdrehen · Leertaste
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 justify-center">
            <button onClick={goPrev} disabled={cardIndex === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <button onClick={() => setFlipped(f => !f)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'white' }}>
              Umdrehen
            </button>
            <button onClick={goNext} disabled={cardIndex === visibleOrder.length - 1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              Weiter <ChevronRight size={16} />
            </button>
          </div>
          <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            ← → Navigieren · Leertaste Umdrehen
          </p>
        </div>
      )}

      {/* ── PRACTICE ──────────────────────────────────────────── */}
      {view === 'practice' && visibleOrder.length > 0 && currentCard && (
        <div className="space-y-5">

          {/* Progress + score (X ✓  Y ✗  like Flippity) */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {cardIndex + 1} / {visibleOrder.length}
            </span>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-green-400">
                {score.correct} <CheckCircle2 size={15} />
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                {score.wrong} <XCircle size={15} />
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ background: 'var(--accent)', width: `${((cardIndex + 1) / visibleOrder.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="rounded-2xl px-6 py-8 text-center"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                Situation
              </span>
              <button onClick={() => toggleStar(currentCard.id)}
                className="transition-all hover:scale-110 active:scale-95">
                <Star size={18} style={{
                  color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)',
                  fill:  stars.has(currentCard.id) ? '#fbbf24' : 'none',
                }} />
              </button>
            </div>

            <p className="text-lg sm:text-xl font-semibold leading-relaxed mb-8" style={{ color: 'var(--text-primary)' }}>
              {currentCard.q}
            </p>

            {/* Input area */}
            {practice.phase === 'input' ? (
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitAnswer() }}
                  placeholder="Buchungssatz eingeben…"
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-mono outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
                />
                <button
                  onClick={submitAnswer}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: 'var(--accent)' }}
                >
                  <Check size={18} className="text-white" />
                </button>
              </div>
            ) : (
              /* Result */
              <div className="space-y-4">
                {/* User input display */}
                <div className="max-w-md mx-auto px-4 py-3 rounded-xl text-sm font-mono text-center"
                  style={{
                    background: practice.correct
                      ? 'rgba(34,197,94,0.1)'
                      : 'rgba(239,68,68,0.08)',
                    border: `2px solid ${practice.correct ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.35)'}`,
                    color: practice.correct ? '#4ade80' : '#f87171',
                  }}>
                  {practice.input}
                </div>

                {/* Correct answer (shown when wrong) */}
                {!practice.correct && (
                  <div className="max-w-md mx-auto space-y-1">
                    <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Richtige Antwort
                    </p>
                    <div className="px-4 py-3 rounded-xl text-sm font-mono font-bold text-center"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                      {currentCard.a}
                    </div>
                  </div>
                )}

                {/* Status icon + override */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {practice.correct ? (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-green-400">
                      <CheckCircle2 size={18} />
                      {practice.overridden ? 'Als richtig gewertet' : 'Richtig!'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                      <XCircle size={18} />
                      Falsch
                    </div>
                  )}

                  {/* "Ich hatte recht" button */}
                  {!practice.correct && !practice.overridden && (
                    <button onClick={handleOverride}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}>
                      <CheckCircle2 size={12} />
                      Ich hatte recht
                    </button>
                  )}
                </div>

                {/* Next / Restart */}
                <div className="flex justify-center">
                  {!isLastCard ? (
                    <button onClick={goNext}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: 'var(--accent)' }}>
                      Weiter <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button onClick={doReset}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: 'var(--accent)' }}>
                      <RotateCcw size={14} /> Neu starten
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Enter zum Bestätigen
          </p>
        </div>
      )}

      {/* Finished banner */}
      {view === 'practice' && isLastCard && practice.phase === 'result' && totalAnswered > 0 && (
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <Trophy size={28} className="mx-auto mb-3 text-amber-400" />
          <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Durchgang abgeschlossen!
          </p>
          <div className="flex items-center justify-center gap-5 mb-4 text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-green-400">
              <CheckCircle2 size={16} /> {score.correct} richtig
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <XCircle size={16} /> {score.wrong} falsch
            </span>
          </div>
          <button onClick={doReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}>
            <RotateCcw size={14} /> Nochmal
          </button>
        </div>
      )}

    </div>
  )
}
