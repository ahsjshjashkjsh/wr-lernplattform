'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CARDS } from '@/data/buchungstrainer-cards'
import {
  Star, List, LayoutGrid, ChevronLeft, ChevronRight,
  Shuffle, RotateCcw, Eye, EyeOff, CheckCircle2,
  XCircle, HelpCircle, Trophy,
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

/** Pick `n` random items from `arr`, excluding `excludeIdx` */
function pickRandom<T>(arr: T[], n: number, excludeIdx: number): T[] {
  const pool = arr.filter((_, i) => i !== excludeIdx)
  const result: T[] = []
  const used = new Set<number>()
  while (result.length < n && used.size < pool.length) {
    const i = Math.floor(Math.random() * pool.length)
    if (!used.has(i)) { used.add(i); result.push(pool[i]) }
  }
  return result
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type View   = 'list' | 'cards' | 'quiz'
type Filter = 'all'  | 'starred'

type QuizState = {
  options:    string[]   // 4 shuffled answer strings
  selected:   string | null
  overridden: boolean    // "Ich hatte recht" gedrückt
}

export default function BuchungstrainerPage() {
  const [stars,       setStars]       = useState<Set<number>>(new Set())
  const [view,        setView]        = useState<View>('list')
  const [filter,      setFilter]      = useState<Filter>('all')

  // Shared card navigation
  const [order,       setOrder]       = useState<number[]>(() => CARDS.map((_, i) => i))
  const [cardIndex,   setCardIndex]   = useState(0)
  const [shuffled,    setShuffled]    = useState(false)

  // Flashcard mode
  const [flipped,     setFlipped]     = useState(false)

  // List mode
  const [showAnswers, setShowAnswers] = useState(false)

  // Quiz mode
  const [quiz,        setQuiz]        = useState<QuizState | null>(null)
  const [quizScore,   setQuizScore]   = useState({ correct: 0, total: 0 })

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

  // Build quiz options whenever card changes in quiz mode
  useEffect(() => {
    if (view !== 'quiz' || !currentCard) return
    const wrong = pickRandom(CARDS, 3, visibleOrder[cardIndex]).map(c => c.a)
    const options = shuffle([currentCard.a, ...wrong])
    setQuiz({ options, selected: null, overridden: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIndex, view, visibleOrder])

  const goNext = useCallback(() => {
    setFlipped(false)
    setCardIndex(i => Math.min(i + 1, visibleOrder.length - 1))
  }, [visibleOrder.length])

  const goPrev = useCallback(() => {
    setFlipped(false)
    setCardIndex(i => Math.max(i - 1, 0))
  }, [])

  const doShuffle = useCallback(() => {
    setOrder(prev => shuffle(prev))
    setCardIndex(0); setFlipped(false); setShuffled(true)
  }, [])

  const doReset = useCallback(() => {
    setOrder(CARDS.map((_, i) => i))
    setCardIndex(0); setFlipped(false); setShuffled(false)
    setQuizScore({ correct: 0, total: 0 })
  }, [])

  const resetQuizScore = () => setQuizScore({ correct: 0, total: 0 })

  // Keyboard nav (flashcard & quiz)
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

  // Reset index on filter change
  useEffect(() => {
    setCardIndex(0); setFlipped(false)
  }, [filter])

  // ── Quiz answer handler ────────────────────────────────────────
  function handleAnswer(option: string) {
    if (!quiz || quiz.selected) return
    const correct = option === currentCard.a
    setQuizScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }))
    setQuiz(q => q ? { ...q, selected: option } : q)
  }

  function handleOverride() {
    // "Ich hatte recht" — reclassify as correct
    setQuizScore(s => ({ correct: s.correct + 1, total: s.total }))
    setQuiz(q => q ? { ...q, overridden: true } : q)
  }

  const starCount = stars.size

  // ── Option styling ─────────────────────────────────────────────
  function optionStyle(option: string): React.CSSProperties {
    if (!quiz?.selected) return {
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
      cursor: 'pointer',
    }
    const isCorrect = option === currentCard.a
    const isSelected = option === quiz.selected
    if (isCorrect || (isSelected && quiz.overridden)) return {
      background: 'rgba(34,197,94,0.12)',
      border: '2px solid rgba(34,197,94,0.5)',
      color: '#4ade80',
    }
    if (isSelected && !quiz.overridden) return {
      background: 'rgba(239,68,68,0.1)',
      border: '2px solid rgba(239,68,68,0.4)',
      color: '#f87171',
    }
    return {
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-muted)',
      opacity: 0.5,
    }
  }

  const answered    = !!quiz?.selected
  const wasWrong    = answered && quiz!.selected !== currentCard.a && !quiz!.overridden
  const isLastCard  = cardIndex === visibleOrder.length - 1

  return (
    <div className="space-y-6 fade-in">

      {/* Header */}
      <div className="pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-3" style={{ color: 'var(--text-muted)' }}>
          Finanz- &amp; Rechnungswesen
        </p>
        <h1
          className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
        >
          Buchungstrainer
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {CARDS.length} Buchungssätze
          {starCount > 0 ? ` · ${starCount} markiert` : ' · Markiere was du noch nicht kannst'}
          {view === 'quiz' && quizScore.total > 0 && (
            <span className="ml-2 font-semibold" style={{ color: quizScore.correct / quizScore.total >= 0.7 ? '#4ade80' : '#f87171' }}>
              · {quizScore.correct}/{quizScore.total} richtig
            </span>
          )}
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
              style={filter === tab.id
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-muted)' }}>
              {tab.id === 'starred' && <Star size={11} className={filter === 'starred' ? 'fill-white' : ''} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'list',  label: 'Liste',        Icon: List },
            { id: 'cards', label: 'Karteikarten', Icon: LayoutGrid },
            { id: 'quiz',  label: 'Quiz',         Icon: HelpCircle },
          ] as const).map(({ id, label, Icon }) => (
            <button key={id}
              onClick={() => { setView(id); if (id === 'quiz') resetQuizScore() }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={view === id ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-muted)' }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* List: show/hide answers */}
        {view === 'list' && (
          <button onClick={() => setShowAnswers(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            {showAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
            {showAnswers ? 'Antworten ausblenden' : 'Antworten zeigen'}
          </button>
        )}

        {/* Cards & Quiz: shuffle / reset */}
        {(view === 'cards' || view === 'quiz') && (
          <>
            <button onClick={doShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <Shuffle size={13} /> Mischen
            </button>
            {(shuffled || quizScore.total > 0) && (
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

      {/* ── LIST VIEW ──────────────────────────────────────────── */}
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
                  <Star size={16} style={{
                    color: isStarred ? '#fbbf24' : 'var(--text-muted)',
                    fill:  isStarred ? '#fbbf24' : 'none',
                  }} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {card.q}
                  </p>
                  {showAnswers && (
                    <p className="text-sm mt-1.5 font-semibold font-mono" style={{ color: 'var(--accent)' }}>
                      {card.a}
                    </p>
                  )}
                </div>
                {!showAnswers && (
                  <span className="shrink-0 text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                    {card.a}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── FLASHCARD VIEW ─────────────────────────────────────── */}
      {view === 'cards' && visibleOrder.length > 0 && currentCard && (
        <div className="space-y-4">
          {/* Progress bar */}
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

          {/* Card */}
          <div
            className="relative rounded-2xl cursor-pointer select-none transition-all duration-150 active:scale-[0.99]"
            style={{
              background: 'var(--card-bg)',
              border: `2px solid ${flipped ? 'var(--accent)' : 'var(--border-color)'}`,
              minHeight: '220px',
            }}
            onClick={() => setFlipped(f => !f)}
          >
            <button className="absolute top-4 right-4 z-10 transition-all hover:scale-110 active:scale-95"
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
              <div className="text-center">
                {!flipped ? (
                  <p className="text-base sm:text-lg font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {currentCard.q}
                  </p>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--accent)' }}>
                    {currentCard.a}
                  </p>
                )}
              </div>
            </div>
            {!flipped && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Tippen zum Umdrehen · Leertaste
              </div>
            )}
          </div>

          {/* Nav */}
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

      {/* ── QUIZ VIEW ──────────────────────────────────────────── */}
      {view === 'quiz' && visibleOrder.length > 0 && currentCard && quiz && (
        <div className="space-y-4">

          {/* Score + progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs w-12 shrink-0" style={{ color: 'var(--text-muted)' }}>
              {cardIndex + 1} / {visibleOrder.length}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ background: 'var(--accent)', width: `${((cardIndex + 1) / visibleOrder.length) * 100}%` }} />
            </div>
            {quizScore.total > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold shrink-0"
                style={{ color: quizScore.correct / quizScore.total >= 0.7 ? '#4ade80' : '#f87171' }}>
                <Trophy size={12} />
                {quizScore.correct}/{quizScore.total}
              </span>
            )}
          </div>

          {/* Question card */}
          <div className="rounded-2xl p-6"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                Situation
              </span>
              <button onClick={() => toggleStar(currentCard.id)}
                className="shrink-0 transition-all hover:scale-110 active:scale-95">
                <Star size={18} style={{
                  color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)',
                  fill:  stars.has(currentCard.id) ? '#fbbf24' : 'none',
                }} />
              </button>
            </div>
            <p className="text-base sm:text-lg font-semibold leading-relaxed mt-3" style={{ color: 'var(--text-primary)' }}>
              {currentCard.q}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quiz.options.map((option, i) => {
              const isCorrect  = option === currentCard.a
              const isSelected = option === quiz.selected
              const showIcon   = !!quiz.selected

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  disabled={!!quiz.selected}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 disabled:cursor-default"
                  style={optionStyle(option)}
                >
                  {/* Letter badge */}
                  <span className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    {['A','B','C','D'][i]}
                  </span>

                  <span className="flex-1 font-mono leading-snug">{option}</span>

                  {showIcon && isCorrect && (
                    <CheckCircle2 size={16} className="shrink-0 text-green-400" />
                  )}
                  {showIcon && isSelected && !isCorrect && !quiz.overridden && (
                    <XCircle size={16} className="shrink-0 text-red-400" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback row */}
          {answered && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: wasWrong
                  ? 'rgba(239,68,68,0.07)'
                  : 'rgba(34,197,94,0.07)',
                border: `1px solid ${wasWrong ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
              }}>

              <div className="flex-1 flex items-center gap-2">
                {wasWrong ? (
                  <>
                    <XCircle size={16} className="shrink-0 text-red-400" />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Falsch — richtig wäre: <span className="font-bold font-mono text-red-300">{currentCard.a}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="shrink-0 text-green-400" />
                    <p className="text-xs font-semibold text-green-400">
                      {quiz.overridden ? 'Als richtig gewertet.' : 'Richtig!'}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* "Ich hatte recht" — nur wenn falsch und noch nicht überschrieben */}
                {wasWrong && !quiz.overridden && (
                  <button
                    onClick={handleOverride}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}>
                    <CheckCircle2 size={12} />
                    Ich hatte recht
                  </button>
                )}

                {/* Weiter / Fertig */}
                {!isLastCard ? (
                  <button onClick={goNext}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--accent)' }}>
                    Weiter <ChevronRight size={13} />
                  </button>
                ) : (
                  <button onClick={doReset}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--accent)' }}>
                    <RotateCcw size={12} /> Neu starten
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Prev nav (quiz) */}
          {!answered && cardIndex > 0 && (
            <button onClick={goPrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <ChevronLeft size={13} /> Zurück
            </button>
          )}

        </div>
      )}

      {/* Finished banner */}
      {view === 'quiz' && isLastCard && quiz?.selected && (
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <Trophy size={28} className="mx-auto mb-3 text-amber-400" />
          <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Durchgang abgeschlossen!
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {quizScore.correct} von {quizScore.total} richtig
            {' '}({Math.round((quizScore.correct / quizScore.total) * 100)}%)
          </p>
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
