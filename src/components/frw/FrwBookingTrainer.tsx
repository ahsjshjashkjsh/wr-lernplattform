'use client'
import { useState, useRef } from 'react'
import { CheckCircle, XCircle, RotateCcw, ChevronRight, Lightbulb, Trophy } from 'lucide-react'

type BookingEntry = {
  id: string
  situation: string
  sollKonto: string
  habenKonto: string
  betragHint?: string | null
  erklaerung?: string | null
}

type Props = {
  bookingEntries: BookingEntry[]
}

type CardState = 'input' | 'correct' | 'wrong' | 'override'

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function FrwBookingTrainer({ bookingEntries }: Props) {
  const [deck, setDeck] = useState<BookingEntry[]>(() => shuffle(bookingEntries))
  const [index, setIndex] = useState(0)
  const [cardState, setCardState] = useState<CardState>('input')
  const [soll, setSoll] = useState('')
  const [haben, setHaben] = useState('')
  const [score, setScore] = useState({ ok: 0, fail: 0 })
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set())
  const [done, setDone] = useState(false)
  const habenRef = useRef<HTMLInputElement>(null)

  const current = deck[index]

  function checkAnswer() {
    if (!current) return
    const sollOk = normalize(soll) === normalize(current.sollKonto)
    const habenOk = normalize(haben) === normalize(current.habenKonto)
    if (sollOk && habenOk) {
      setScore(s => ({ ...s, ok: s.ok + 1 }))
      setCardState('correct')
    } else {
      setScore(s => ({ ...s, fail: s.fail + 1 }))
      setWrongIds(prev => new Set([...prev, current.id]))
      setCardState('wrong')
    }
  }

  function handleOverride() {
    setScore(s => ({ ...s, ok: s.ok + 1, fail: Math.max(0, s.fail - 1) }))
    setWrongIds(prev => {
      const next = new Set(prev)
      next.delete(current.id)
      return next
    })
    setCardState('override')
  }

  function next() {
    if (index + 1 >= deck.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setCardState('input')
      setSoll('')
      setHaben('')
    }
  }

  function restart() {
    setDeck(shuffle(bookingEntries))
    setIndex(0)
    setCardState('input')
    setSoll('')
    setHaben('')
    setScore({ ok: 0, fail: 0 })
    setWrongIds(new Set())
    setDone(false)
  }

  function restartWrong() {
    const wrong = bookingEntries.filter(e => wrongIds.has(e.id))
    setDeck(shuffle(wrong))
    setIndex(0)
    setCardState('input')
    setSoll('')
    setHaben('')
    setScore({ ok: 0, fail: 0 })
    setWrongIds(new Set())
    setDone(false)
  }

  // Done screen
  if (done) {
    const total = score.ok + score.fail
    const pct = total > 0 ? Math.round((score.ok / total) * 100) : 100
    const hasWrong = wrongIds.size > 0
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: pct >= 80 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${pct >= 80 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          <Trophy size={28} className={pct >= 80 ? 'text-emerald-400' : 'text-red-400'} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {pct >= 80 ? 'Gut gemacht!' : 'Noch nicht ganz!'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {score.ok} von {total} Buchungssätzen richtig — {pct}%
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          {hasWrong && (
            <button
              onClick={restartWrong}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-125"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
            >
              <RotateCcw size={13} />
              Falsche wiederholen ({wrongIds.size})
            </button>
          )}
          <button
            onClick={restart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-125"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
          >
            <RotateCcw size={13} />
            Alle nochmal
          </button>
        </div>
      </div>
    )
  }

  const isRevealed = cardState === 'correct' || cardState === 'wrong' || cardState === 'override'
  const isCorrect = cardState === 'correct' || cardState === 'override'

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>Aufgabe {index + 1} / {deck.length}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle size={12} /> {score.ok}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <XCircle size={12} /> {score.fail}
          </span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${((index) / deck.length) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
        />
      </div>

      {/* Situation Card */}
      <div
        className="p-5 rounded-2xl space-y-4"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Situation</p>
          <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {current.situation}
          </p>
          {current.betragHint && (
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-mono text-emerald-400" style={{ background: 'rgba(34,197,94,0.1)' }}>
              {current.betragHint}
            </span>
          )}
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">Soll (Debit)</label>
            <input
              value={soll}
              onChange={e => setSoll(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (!isRevealed) habenRef.current?.focus()
                }
              }}
              disabled={isRevealed}
              placeholder="Konto eingeben…"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                background: isRevealed
                  ? (normalize(soll) === normalize(current.sollKonto) ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)')
                  : 'rgba(59,130,246,0.06)',
                border: isRevealed
                  ? `1px solid ${normalize(soll) === normalize(current.sollKonto) ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`
                  : '1px solid rgba(59,130,246,0.25)',
                color: 'var(--text-primary)',
              }}
            />
            {isRevealed && normalize(soll) !== normalize(current.sollKonto) && (
              <p className="text-xs text-emerald-400 pl-1">
                Richtig: <span className="font-semibold">{current.sollKonto}</span>
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Haben (Kredit)</label>
            <input
              ref={habenRef}
              value={haben}
              onChange={e => setHaben(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !isRevealed) checkAnswer()
              }}
              disabled={isRevealed}
              placeholder="Konto eingeben…"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                background: isRevealed
                  ? (normalize(haben) === normalize(current.habenKonto) ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)')
                  : 'rgba(34,197,94,0.06)',
                border: isRevealed
                  ? `1px solid ${normalize(haben) === normalize(current.habenKonto) ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`
                  : '1px solid rgba(34,197,94,0.25)',
                color: 'var(--text-primary)',
              }}
            />
            {isRevealed && normalize(haben) !== normalize(current.habenKonto) && (
              <p className="text-xs text-emerald-400 pl-1">
                Richtig: <span className="font-semibold">{current.habenKonto}</span>
              </p>
            )}
          </div>
        </div>

        {/* Feedback badge */}
        {isRevealed && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}
            style={{ background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {isCorrect ? 'Richtig!' : 'Nicht ganz — die richtigen Konten sind oben markiert.'}
          </div>
        )}

        {/* Erklärung */}
        {isRevealed && current.erklaerung && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
            <Lightbulb size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <span style={{ color: 'var(--text-muted)' }}>{current.erklaerung}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3">
        {!isRevealed ? (
          <button
            onClick={checkAnswer}
            disabled={!soll.trim() || !haben.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
          >
            Prüfen
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            {cardState === 'wrong' && (
              <button
                onClick={handleOverride}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-125"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', color: '#fcd34d' }}
              >
                Ich hatte recht
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
            >
              {index + 1 < deck.length ? (
                <>Weiter <ChevronRight size={15} /></>
              ) : (
                'Auswertung'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
