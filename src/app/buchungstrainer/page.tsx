'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CARDS } from '@/data/buchungstrainer-cards'
import {
  Star, List, LayoutGrid, ChevronLeft, ChevronRight,
  Shuffle, RotateCcw, Eye, EyeOff, BookOpen,
} from 'lucide-react'

const LS_KEY = 'buchungstrainer-stars'

function loadStars(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveStars(stars: Set<number>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...stars]))
}

type View = 'list' | 'cards'
type Filter = 'all' | 'starred'

export default function BuchungstrainerPage() {
  const [stars, setStars] = useState<Set<number>>(new Set())
  const [view, setView] = useState<View>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [flipped, setFlipped] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [shuffled, setShuffled] = useState(false)
  const [order, setOrder] = useState<number[]>(() => CARDS.map((_, i) => i))
  const [showAnswers, setShowAnswers] = useState(false)

  useEffect(() => {
    setStars(loadStars())
  }, [])

  const toggleStar = useCallback((id: number) => {
    setStars(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveStars(next)
      return next
    })
  }, [])

  const visibleOrder = useMemo(() => {
    const base = filter === 'starred' ? order.filter(i => stars.has(CARDS[i].id)) : order
    return base
  }, [order, filter, stars])

  const currentCard = CARDS[visibleOrder[cardIndex] ?? 0]

  const goNext = useCallback(() => {
    setFlipped(false)
    setCardIndex(i => Math.min(i + 1, visibleOrder.length - 1))
  }, [visibleOrder.length])

  const goPrev = useCallback(() => {
    setFlipped(false)
    setCardIndex(i => Math.max(i - 1, 0))
  }, [])

  const doShuffle = useCallback(() => {
    const arr = [...order]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setOrder(arr)
    setCardIndex(0)
    setFlipped(false)
    setShuffled(true)
  }, [order])

  const doReset = useCallback(() => {
    setOrder(CARDS.map((_, i) => i))
    setCardIndex(0)
    setFlipped(false)
    setShuffled(false)
  }, [])

  // Keyboard nav in card mode
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

  // Reset card index when filter changes
  useEffect(() => {
    setCardIndex(0)
    setFlipped(false)
  }, [filter])

  const starCount = stars.size

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
          {CARDS.length} Buchungssätze · {starCount > 0 ? `${starCount} markiert` : 'Markiere was du noch nicht kannst'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Filter */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          {([
            { id: 'all',     label: `Alle (${CARDS.length})` },
            { id: 'starred', label: `Markierte (${starCount})` },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === tab.id
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-muted)' }
              }
            >
              {tab.id === 'starred' && <Star size={11} className={filter === 'starred' ? 'fill-white' : ''} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={view === 'list' ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-muted)' }}
          >
            <List size={13} /> Liste
          </button>
          <button
            onClick={() => setView('cards')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={view === 'cards' ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-muted)' }}
          >
            <LayoutGrid size={13} /> Karteikarten
          </button>
        </div>

        {/* List: show/hide answers */}
        {view === 'list' && (
          <button
            onClick={() => setShowAnswers(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            {showAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
            {showAnswers ? 'Antworten ausblenden' : 'Antworten zeigen'}
          </button>
        )}

        {/* Cards: shuffle / reset */}
        {view === 'cards' && (
          <>
            <button
              onClick={doShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            >
              <Shuffle size={13} /> Mischen
            </button>
            {shuffled && (
              <button
                onClick={doReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
              >
                <RotateCcw size={13} /> Zurücksetzen
              </button>
            )}
          </>
        )}
      </div>

      {/* Empty state for starred filter */}
      {filter === 'starred' && starCount === 0 && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <Star size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Keine markierten Karten</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Klicke den Stern bei Karten, die du noch nicht kannst.
          </p>
        </div>
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────── */}
      {view === 'list' && (filter !== 'starred' || starCount > 0) && (
        <div className="space-y-2">
          {visibleOrder.map(idx => {
            const card = CARDS[idx]
            const isStarred = stars.has(card.id)
            return (
              <div
                key={card.id}
                className="rounded-xl px-4 py-3.5 flex items-start gap-3 transition-all"
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid ${isStarred ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}`,
                }}
              >
                <button
                  onClick={() => toggleStar(card.id)}
                  className="shrink-0 mt-0.5 transition-all hover:scale-110 active:scale-95"
                  aria-label="Markieren"
                >
                  <Star
                    size={16}
                    style={{
                      color: isStarred ? '#fbbf24' : 'var(--text-muted)',
                      fill: isStarred ? '#fbbf24' : 'none',
                    }}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {card.q}
                  </p>
                  {showAnswers && (
                    <p
                      className="text-sm mt-1.5 font-semibold"
                      style={{ color: 'var(--accent)' }}
                    >
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

      {/* ── CARD VIEW ─────────────────────────────────────────── */}
      {view === 'cards' && visibleOrder.length > 0 && currentCard && (
        <div className="space-y-4">

          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {cardIndex + 1} / {visibleOrder.length}
            </span>
            <div className="flex-1 mx-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  background: 'var(--accent)',
                  width: `${((cardIndex + 1) / visibleOrder.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
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
            {/* Star button */}
            <button
              className="absolute top-4 right-4 transition-all hover:scale-110 active:scale-95 z-10"
              onClick={e => { e.stopPropagation(); toggleStar(currentCard.id) }}
              aria-label="Markieren"
            >
              <Star
                size={20}
                style={{
                  color: stars.has(currentCard.id) ? '#fbbf24' : 'var(--text-muted)',
                  fill: stars.has(currentCard.id) ? '#fbbf24' : 'none',
                }}
              />
            </button>

            {/* Side label */}
            <div className="absolute top-4 left-4">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={flipped
                  ? { background: 'rgba(79,114,245,0.15)', color: 'var(--accent)' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }
                }
              >
                {flipped ? 'Buchungssatz' : 'Situation'}
              </span>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center px-8 pt-14 pb-10 min-h-[220px]">
              <div className="text-center">
                {!flipped ? (
                  <p
                    className="text-base sm:text-lg font-semibold leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentCard.q}
                  </p>
                ) : (
                  <p
                    className="text-xl sm:text-2xl font-bold font-mono tracking-wide"
                    style={{ color: 'var(--accent)' }}
                  >
                    {currentCard.a}
                  </p>
                )}
              </div>
            </div>

            {/* Flip hint */}
            {!flipped && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Tippen zum Umdrehen · Leertaste
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={goPrev}
              disabled={cardIndex === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={16} /> Zurück
            </button>
            <button
              onClick={() => setFlipped(f => !f)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Umdrehen
            </button>
            <button
              onClick={goNext}
              disabled={cardIndex === visibleOrder.length - 1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Weiter <ChevronRight size={16} />
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
            ← → Navigieren · Leertaste Umdrehen
          </p>
        </div>
      )}

    </div>
  )
}
