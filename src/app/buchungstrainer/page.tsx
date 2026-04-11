'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { CARDS } from '@/data/buchungstrainer-cards'
import {
  Star, List, LayoutGrid, ChevronLeft, ChevronRight,
  Shuffle, RotateCcw, Eye, EyeOff, PenLine,
  CheckCircle2, XCircle, Lightbulb, Trophy,
} from 'lucide-react'

const LS_KEY = 'buchungstrainer-stars'

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

/**
 * Lenient answer check for FRW Buchungssätze:
 * - case-insensitive
 * - normalise whitespace and spaces around "/"
 * - treat "." at end as optional
 */
function checkAnswer(input: string, correct: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s*\/\s*/g, '/')   // "WaA / VLL" → "waa/vll"
      .replace(/\s+/g, ' ')
      .replace(/\.$/, '')
  return norm(input) === norm(correct)
}

type View   = 'list' | 'cards' | 'practice'
type Filter = 'all'  | 'starred'
type Phase  = 'input' | 'correct' | 'wrong' | 'overridden'

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
  const [phase,       setPhase]       = useState<Phase>('input')
  const [inputValue,  setInputValue]  = useState('')
  const [hint,        setHint]        = useState(false)
  const [score,       setScore]       = useState({ ok: 0, fail: 0 })
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

  const visibleOrder = useMemo(() => (
    filter === 'starred' ? order.filter(i => stars.has(CARDS[i].id)) : order
  ), [order, filter, stars])

  const currentCard = CARDS[visibleOrder[cardIndex] ?? 0]
  const isLast = cardIndex === visibleOrder.length - 1
  const starCount = stars.size

  /* ── navigation ── */
  const resetPractice = () => {
    setPhase('input'); setInputValue(''); setHint(false)
  }
  const goNext = useCallback(() => {
    setFlipped(false); resetPractice()
    setCardIndex(i => Math.min(i + 1, visibleOrder.length - 1))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleOrder.length])

  const goPrev = useCallback(() => {
    setFlipped(false); resetPractice()
    setCardIndex(i => Math.max(i - 1, 0))
  }, [])

  const doShuffle = useCallback(() => {
    setOrder(prev => shuffleArr(prev))
    setCardIndex(0); setFlipped(false); resetPractice(); setShuffled(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doReset = () => {
    setOrder(CARDS.map((_, i) => i))
    setCardIndex(0); setFlipped(false); resetPractice()
    setShuffled(false); setScore({ ok: 0, fail: 0 })
  }

  /* ── keyboard (flashcard) ── */
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

  /* ── keyboard (practice) — global listener ── */
  useEffect(() => {
    if (view !== 'practice') return
    const h = (e: KeyboardEvent) => {
      // Enter when answered → next card
      if (e.key === 'Enter' && phaseRef.current !== 'input') {
        e.preventDefault()
        if (!isLastRef.current) goNextRef.current()
      }
      // K → "Ich hatte recht" when wrong
      if ((e.key === 'k' || e.key === 'K') && phaseRef.current === 'wrong') {
        e.preventDefault()
        overrideRef.current()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [view]) // only re-bind when view changes; refs keep values fresh

  // Refs so the event listener above always sees current values
  const phaseRef    = useRef(phase)
  const isLastRef   = useRef(isLast)
  const goNextRef   = useRef(goNext)
  const overrideRef = useRef(handleOverride)
  useEffect(() => { phaseRef.current  = phase   }, [phase])
  useEffect(() => { isLastRef.current = isLast  }, [isLast])
  useEffect(() => { goNextRef.current = goNext  }, [goNext])

  /* ── auto-focus practice input ── */
  useEffect(() => {
    if (view === 'practice' && phase === 'input')
      setTimeout(() => inputRef.current?.focus(), 30)
  }, [view, phase, cardIndex])

  useEffect(() => { resetPractice() }, [filter]) // eslint-disable-line

  /* ── practice: submit (called by input onKeyDown Enter OR Prüfen button) ── */
  function handleEnter() {
    if (phase !== 'input') return
    if (!inputValue.trim()) return
    const ok = checkAnswer(inputValue, currentCard.a)
    setScore(s => ({ ok: s.ok + (ok ? 1 : 0), fail: s.fail + (ok ? 0 : 1) }))
    setPhase(ok ? 'correct' : 'wrong')
  }

  function handleOverride() {
    setScore(s => ({ ok: s.ok + 1, fail: Math.max(s.fail - 1, 0) }))
    setPhase('overridden')
  }

  // keep overrideRef in sync (defined after handleOverride)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { overrideRef.current = handleOverride }, [phase])

  /* ── hint: first char of each account ── */
  function buildHint(answer: string) {
    return answer
      .split('/')
      .map(part => part.trim().charAt(0).toUpperCase() + '…')
      .join(' / ')
  }

  const totalAnswered = score.ok + score.fail

  /* ── border colour for practice input ── */
  const inputBorderColor =
    phase === 'input'     ? 'var(--border-color)'
    : phase === 'correct' || phase === 'overridden' ? 'rgba(34,197,94,0.5)'
    : 'rgba(239,68,68,0.5)'

  const inputColor =
    phase === 'input'                               ? 'var(--text-primary)'
    : phase === 'correct' || phase === 'overridden' ? '#4ade80'
    : '#f87171'

  return (
    <div className="space-y-6 fade-in">

      {/* ── Header ── */}
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
          {CARDS.length} Buchungssätze
          {starCount > 0 ? ` · ${starCount} markiert` : ' · Markiere was du noch nicht kannst'}
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Filter */}
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'all',     label: `Alle (${CARDS.length})` },
            { id: 'starred', label: `Markierte (${starCount})` },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === t.id ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-muted)' }}>
              {t.id === 'starred' && <Star size={11} className={filter === 'starred' ? 'fill-white' : ''} />}
              {t.label}
            </button>
          ))}
        </div>

        {/* View */}
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'list',     label: 'Liste',        Icon: List       },
            { id: 'cards',    label: 'Karteikarten', Icon: LayoutGrid },
            { id: 'practice', label: 'Practice',     Icon: PenLine    },
          ] as const).map(({ id, label, Icon }) => (
            <button key={id}
              onClick={() => { setView(id); if (id === 'practice') doReset() }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={view === id ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-muted)' }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {view === 'list' && (
          <button onClick={() => setShowAnswers(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            {showAnswers ? <EyeOff size={13}/> : <Eye size={13}/>}
            {showAnswers ? 'Ausblenden' : 'Antworten zeigen'}
          </button>
        )}

        {(view === 'cards' || view === 'practice') && (
          <>
            <button onClick={doShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <Shuffle size={13}/> Mischen
            </button>
            {(shuffled || totalAnswered > 0) && (
              <button onClick={doReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <RotateCcw size={13}/> Neu starten
              </button>
            )}
          </>
        )}
      </div>

      {/* Empty starred */}
      {filter === 'starred' && starCount === 0 && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <Star size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }}/>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Keine markierten Karten</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Klicke den Stern bei Karten die du noch nicht kannst.</p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          LIST
      ════════════════════════════════════════════════════ */}
      {view === 'list' && (filter !== 'starred' || starCount > 0) && (
        <div className="space-y-2">
          {visibleOrder.map(idx => {
            const card = CARDS[idx]; const st = stars.has(card.id)
            return (
              <div key={card.id} className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                style={{ background: 'var(--card-bg)', border: `1px solid ${st ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}` }}>
                <button onClick={() => toggleStar(card.id)} className="shrink-0 mt-0.5 hover:scale-110 transition-transform">
                  <Star size={16} style={{ color: st ? '#fbbf24' : 'var(--text-muted)', fill: st ? '#fbbf24' : 'none' }}/>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{card.q}</p>
                  {showAnswers && <p className="text-sm mt-1.5 font-semibold font-mono" style={{ color: 'var(--accent)' }}>{card.a}</p>}
                </div>
                {!showAnswers && <span className="shrink-0 text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{card.a}</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          FLASHCARDS
      ════════════════════════════════════════════════════ */}
      {view === 'cards' && visibleOrder.length > 0 && currentCard && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>{cardIndex+1} / {visibleOrder.length}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ background: 'var(--accent)', width: `${((cardIndex+1)/visibleOrder.length)*100}%` }}/>
            </div>
          </div>

          <div className="relative rounded-2xl cursor-pointer select-none active:scale-[0.99] transition-transform"
            style={{ background: 'var(--card-bg)', border: `2px solid ${flipped ? 'var(--accent)' : 'var(--border-color)'}`, minHeight: 220 }}
            onClick={() => setFlipped(f => !f)}>
            <button className="absolute top-4 right-4 z-10 hover:scale-110 transition-transform"
              onClick={e => { e.stopPropagation(); toggleStar(currentCard.id) }}>
              <Star size={20} style={{ color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)', fill: stars.has(currentCard.id) ? '#fbbf24' : 'none' }}/>
            </button>
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={flipped ? { background: 'rgba(79,114,245,0.15)', color: 'var(--accent)' } : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                {flipped ? 'Buchungssatz' : 'Situation'}
              </span>
            </div>
            <div className="flex items-center justify-center px-8 pt-14 pb-10 min-h-[220px]">
              {!flipped
                ? <p className="text-center text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{currentCard.q}</p>
                : <p className="text-center text-xl sm:text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--accent)' }}>{currentCard.a}</p>
              }
            </div>
            {!flipped && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>Tippen · Leertaste</div>}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={goPrev} disabled={cardIndex===0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={16}/> Zurück
            </button>
            <button onClick={() => setFlipped(f=>!f)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'white' }}>
              Umdrehen
            </button>
            <button onClick={goNext} disabled={cardIndex===visibleOrder.length-1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              Weiter <ChevronRight size={16}/>
            </button>
          </div>
          <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>← → Navigieren · Leertaste Umdrehen</p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PRACTICE  (Flippity-style)
      ════════════════════════════════════════════════════ */}
      {view === 'practice' && visibleOrder.length > 0 && currentCard && (
        <div className="max-w-lg mx-auto space-y-6">

          {/* Score row */}
          <div className="flex items-center justify-between text-sm font-semibold">
            <span style={{ color: 'var(--text-muted)' }}>{cardIndex+1} / {visibleOrder.length}</span>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-green-400">
                {score.ok} <CheckCircle2 size={16}/>
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                {score.fail} <XCircle size={16}/>
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="text-center px-2 py-6">
            <p className="text-xl sm:text-2xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {currentCard.q}
            </p>

            {/* Hint */}
            {hint && phase === 'input' && (
              <p className="mt-3 text-sm font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
                Tipp: <span style={{ color: 'var(--accent)' }}>{buildHint(currentCard.a)}</span>
              </p>
            )}
          </div>

          {/* Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              disabled={phase !== 'input'}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleEnter() }}
              placeholder="Buchungssatz eingeben…"
              className="w-full px-5 py-4 rounded-2xl text-base font-mono text-center outline-none transition-all"
              style={{
                background: 'var(--card-bg)',
                border: `2px solid ${inputBorderColor}`,
                color: inputColor,
              }}
            />

            {/* Correct answer shown when wrong */}
            {(phase === 'wrong') && (
              <div className="mt-3 text-center">
                <p className="text-[11px] uppercase tracking-widest mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Richtige Antwort</p>
                <p className="text-base font-bold font-mono" style={{ color: '#4ade80' }}>{currentCard.a}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-3">

            {phase === 'input' && (
              <div className="flex gap-3 w-full">
                {/* Hint button */}
                <button onClick={() => setHint(h => !h)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <Lightbulb size={14}/> Tipp
                </button>

                {/* Star */}
                <button onClick={() => toggleStar(currentCard.id)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: stars.has(currentCard.id) ? 'rgba(245,158,11,0.1)' : 'var(--card-bg)',
                    border: `1px solid ${stars.has(currentCard.id) ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}`,
                    color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)',
                  }}>
                  <Star size={14} style={{ fill: stars.has(currentCard.id) ? '#fbbf24' : 'none' }}/>
                  {stars.has(currentCard.id) ? 'Markiert' : 'Markieren'}
                </button>

                {/* Submit */}
                <button onClick={handleEnter} disabled={!inputValue.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: 'var(--accent)' }}>
                  <CheckCircle2 size={16}/> Prüfen
                </button>
              </div>
            )}

            {phase !== 'input' && (
              <div className="flex flex-col items-center gap-3 w-full">

                {/* "Ich hatte recht" */}
                {phase === 'wrong' && (
                  <button onClick={handleOverride}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full justify-center"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}>
                    <CheckCircle2 size={15}/>
                    Ich hatte recht
                    <span className="ml-1 text-[11px] font-normal px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(34,197,94,0.2)', color: '#86efac' }}>
                      K
                    </span>
                  </button>
                )}

                {/* Weiter / Fertig — Enter works too */}
                {!isLast ? (
                  <button onClick={goNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white w-full justify-center transition-all"
                    style={{ background: 'var(--accent)' }}>
                    Weiter <ChevronRight size={15}/>
                  </button>
                ) : (
                  <button onClick={doReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white w-full justify-center"
                    style={{ background: 'var(--accent)' }}>
                    <RotateCcw size={14}/> Neu starten
                  </button>
                )}

                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Enter = Weiter{phase === 'wrong' ? ' · K = Ich hatte recht' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Prev link (subtle) */}
          {cardIndex > 0 && phase === 'input' && (
            <div className="text-center">
              <button onClick={goPrev} className="text-xs flex items-center gap-1 mx-auto" style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={12}/> Vorherige Karte
              </button>
            </div>
          )}
        </div>
      )}

      {/* Finished */}
      {view === 'practice' && isLast && phase !== 'input' && totalAnswered > 0 && (
        <div className="max-w-lg mx-auto rounded-2xl p-6 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <Trophy size={32} className="mx-auto mb-3 text-amber-400"/>
          <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Fertig!</p>
          <div className="flex justify-center gap-8 mb-5 text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-green-400"><CheckCircle2 size={16}/>{score.ok} richtig</span>
            <span className="flex items-center gap-1.5 text-red-400"><XCircle size={16}/>{score.fail} falsch</span>
          </div>
          <p className="text-2xl font-extrabold mb-5" style={{ color: 'var(--accent)' }}>
            {Math.round((score.ok / totalAnswered) * 100)}%
          </p>
          <button onClick={doReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}>
            <RotateCcw size={14}/> Nochmal
          </button>
        </div>
      )}

    </div>
  )

  function buildHint(answer: string) {
    return answer.split('/').map(p => p.trim().charAt(0).toUpperCase() + '…').join(' / ')
  }
}
