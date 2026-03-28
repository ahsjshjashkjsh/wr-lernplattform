'use client'
import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, RotateCcw, ChevronRight, Trophy, Lightbulb, Eye } from 'lucide-react'

export type BookingEntry = {
  id: string
  situation: string
  sollKonto: string
  habenKonto: string
  betragHint?: string | null
  erklaerung?: string | null
}

type QuestionType = 'soll' | 'haben' | 'both'

type Question = {
  entry: BookingEntry
  type: QuestionType
  // randomly sometimes hide the betragHint for extra difficulty
  showBetrag: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isCorrect(input: string, expected: string) {
  return normalize(input) === normalize(expected)
}

function buildQuestions(entries: BookingEntry[]): Question[] {
  const types: QuestionType[] = ['soll', 'haben', 'both']
  const questions: Question[] = []

  for (const entry of entries) {
    // Each entry generates 2–3 different question types (all 3 if ≤10 entries, else 2 random)
    const selectedTypes = entries.length <= 12
      ? types
      : shuffle(types).slice(0, 2)

    for (const type of selectedTypes) {
      questions.push({
        entry,
        type,
        showBetrag: Math.random() > 0.4, // 60% chance betrag is shown
      })
    }
  }

  return shuffle(questions)
}

function QuestionLabel({ type }: { type: QuestionType }) {
  if (type === 'soll') return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-blue-300" style={{ background: 'rgba(59,130,246,0.15)' }}>
      Soll-Konto gesucht
    </span>
  )
  if (type === 'haben') return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-300" style={{ background: 'rgba(34,197,94,0.15)' }}>
      Haben-Konto gesucht
    </span>
  )
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)' }}>
      Beide Konten gesucht
    </span>
  )
}

type Props = {
  entries: BookingEntry[]
  chapterTitle?: string
}

export function BookingTrainer({ entries, chapterTitle }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions(entries))
  const [index, setIndex] = useState(0)
  const [inputSoll, setInputSoll] = useState('')
  const [inputHaben, setInputHaben] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [done, setDone] = useState(false)

  const q = questions[index]

  const handleCheck = useCallback(() => {
    if (!q) return
    let correct = false
    if (q.type === 'soll') {
      correct = isCorrect(inputSoll, q.entry.sollKonto)
    } else if (q.type === 'haben') {
      correct = isCorrect(inputHaben, q.entry.habenKonto)
    } else {
      correct = isCorrect(inputSoll, q.entry.sollKonto) && isCorrect(inputHaben, q.entry.habenKonto)
    }
    if (correct) setScore(s => s + 1)
    setChecked(true)
  }, [q, inputSoll, inputHaben])

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setInputSoll('')
      setInputHaben('')
      setChecked(false)
      setShowHint(false)
    }
  }, [index, questions.length])

  const handleRestart = useCallback(() => {
    setQuestions(buildQuestions(entries))
    setIndex(0)
    setInputSoll('')
    setInputHaben('')
    setChecked(false)
    setShowHint(false)
    setScore(0)
    setDone(false)
  }, [entries])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!checked) handleCheck()
      else handleNext()
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Keine Buchungssätze vorhanden.</p>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'
    return (
      <div className="text-center py-8 space-y-6">
        <div
          className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {emoji}
        </div>
        <div>
          <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Runde abgeschlossen
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {score} von {questions.length} richtig — {pct}%
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {/* Score bar */}
          <div className="w-48 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct >= 80 ? '#22c55e' : pct >= 60 ? '#3b82f6' : '#f59e0b',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
        >
          <RotateCcw size={14} />
          Neue Runde (anders gemischt)
        </button>
      </div>
    )
  }

  const sollCorrect = isCorrect(inputSoll, q.entry.sollKonto)
  const habenCorrect = isCorrect(inputHaben, q.entry.habenKonto)

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>Frage {index + 1} / {questions.length}</span>
        <span className="text-emerald-400 font-medium">{score} richtig</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((index) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <QuestionLabel type={q.type} />
            <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {q.entry.situation}
            </p>
            {q.showBetrag && q.entry.betragHint && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-full font-mono text-emerald-400" style={{ background: 'rgba(34,197,94,0.1)' }}>
                {q.entry.betragHint}
              </span>
            )}
          </div>
        </div>

        {/* T-Konto visual with inputs */}
        <div className="rounded-xl overflow-hidden text-xs font-mono" style={{ border: '1px solid var(--border-color)' }}>
          <div className="grid grid-cols-2">
            <div className="px-3 py-2 font-semibold text-blue-400" style={{ background: 'rgba(59,130,246,0.08)', borderRight: '2px solid var(--border-color)' }}>
              Soll (Debit)
            </div>
            <div className="px-3 py-2 font-semibold text-emerald-400" style={{ background: 'rgba(34,197,94,0.08)' }}>
              Haben (Kredit)
            </div>
          </div>
          <div className="grid grid-cols-2">
            {/* Soll side */}
            <div className="px-3 py-3" style={{ borderRight: '2px solid var(--border-color)', background: 'rgba(59,130,246,0.04)' }}>
              {q.type === 'haben' ? (
                // Show soll, hide haben
                <span className="text-blue-300">{q.entry.sollKonto}</span>
              ) : checked ? (
                <div className="space-y-1">
                  <div className={`font-semibold ${sollCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {inputSoll || '—'}
                  </div>
                  {!sollCorrect && (
                    <div className="text-emerald-400 text-[10px]">✓ {q.entry.sollKonto}</div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={inputSoll}
                  onChange={e => setInputSoll(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Soll-Konto..."
                  autoFocus
                  className="w-full bg-transparent outline-none text-blue-300 placeholder:text-blue-900 text-xs"
                />
              )}
            </div>
            {/* Haben side */}
            <div className="px-3 py-3" style={{ background: 'rgba(34,197,94,0.04)' }}>
              {q.type === 'soll' ? (
                // Show haben, hide soll
                <span className="text-emerald-300">{q.entry.habenKonto}</span>
              ) : checked ? (
                <div className="space-y-1">
                  <div className={`font-semibold ${habenCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {inputHaben || '—'}
                  </div>
                  {!habenCorrect && (
                    <div className="text-emerald-400 text-[10px]">✓ {q.entry.habenKonto}</div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={inputHaben}
                  onChange={e => setInputHaben(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Haben-Konto..."
                  className="w-full bg-transparent outline-none text-emerald-300 placeholder:text-emerald-900 text-xs"
                />
              )}
            </div>
          </div>
        </div>

        {/* Feedback after check */}
        {checked && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
            (q.type === 'soll' ? sollCorrect : q.type === 'haben' ? habenCorrect : sollCorrect && habenCorrect)
              ? 'text-emerald-300'
              : 'text-red-300'
          }`} style={{
            background: (q.type === 'soll' ? sollCorrect : q.type === 'haben' ? habenCorrect : sollCorrect && habenCorrect)
              ? 'rgba(34,197,94,0.08)'
              : 'rgba(239,68,68,0.08)',
            border: (q.type === 'soll' ? sollCorrect : q.type === 'haben' ? habenCorrect : sollCorrect && habenCorrect)
              ? '1px solid rgba(34,197,94,0.2)'
              : '1px solid rgba(239,68,68,0.2)',
          }}>
            {(q.type === 'soll' ? sollCorrect : q.type === 'haben' ? habenCorrect : sollCorrect && habenCorrect)
              ? <CheckCircle size={14} className="mt-0.5 shrink-0" />
              : <XCircle size={14} className="mt-0.5 shrink-0" />
            }
            <span>
              {(q.type === 'soll' ? sollCorrect : q.type === 'haben' ? habenCorrect : sollCorrect && habenCorrect)
                ? 'Richtig!'
                : 'Nicht ganz — die richtige Antwort ist oben angezeigt.'
              }
            </span>
          </div>
        )}

        {/* Erklaerung hint */}
        {checked && q.entry.erklaerung && (
          <div className="text-xs pl-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {q.entry.erklaerung}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {!checked ? (
          <>
            <button
              onClick={() => setShowHint(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}
            >
              <Lightbulb size={12} />
              Tipp
            </button>
            <button
              onClick={handleCheck}
              disabled={
                q.type === 'soll' ? !inputSoll.trim() :
                q.type === 'haben' ? !inputHaben.trim() :
                !inputSoll.trim() || !inputHaben.trim()
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              Prüfen
              <ChevronRight size={14} />
            </button>
          </>
        ) : (
          <>
            <div />
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              {index + 1 >= questions.length ? 'Auswertung' : 'Weiter'}
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {showHint && !checked && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}
        >
          <Lightbulb size={12} className="text-amber-400 mt-0.5 shrink-0" />
          <span style={{ color: 'var(--text-secondary)' }}>
            {q.entry.erklaerung ?? 'Kein Tipp verfügbar.'}
          </span>
        </div>
      )}
    </div>
  )
}
