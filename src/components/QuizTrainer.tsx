'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react'

type Option = { id: string; text: string; isCorrect: boolean; order: number }
export type QuizQuestion = {
  id: string
  questionText: string
  explanation: string
  difficulty: string
  options: Option[]
}

const DIFF_LABEL: Record<string, string> = { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer' }
const DIFF_COLOR: Record<string, string> = { easy: '#4ade80', medium: '#fbbf24', hard: '#f87171' }

export function QuizTrainer({ questions }: { questions: QuizQuestion[] }) {
  const [idx, setIdx]         = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore]     = useState(0)
  const [done, setDone]       = useState(false)

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Quiz-Fragen vorhanden.</p>
      </div>
    )
  }

  const q     = questions[idx]
  const color = DIFF_COLOR[q.difficulty] ?? '#fbbf24'
  const answered = selected !== null
  const correct  = answered && (q.options.find(o => o.id === selected)?.isCorrect ?? false)

  function pick(optId: string) {
    if (answered) return
    setSelected(optId)
    if (q.options.find(o => o.id === optId)?.isCorrect) setScore(s => s + 1)
  }

  function next() {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1)
      setSelected(null)
    } else {
      setDone(true)
    }
  }

  function reset() {
    setIdx(0); setSelected(null); setScore(0); setDone(false)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const trophyColor = pct >= 80 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171'
    return (
      <div className="text-center py-10 space-y-5">
        <Trophy size={44} style={{ color: trophyColor }} className="mx-auto" />
        <div>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {score}/{questions.length}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{pct}% richtig</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {pct >= 80 ? 'Ausgezeichnet!' : pct >= 50 ? 'Gut gemacht — noch etwas Übung.' : 'Noch einmal üben.'}
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
        >
          <RotateCcw size={14} /> Nochmal starten
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
        <span>Frage {idx + 1} / {questions.length}</span>
        <span
          className="px-2 py-0.5 rounded-full font-semibold"
          style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}
        >
          {DIFF_LABEL[q.difficulty] ?? q.difficulty}
        </span>
      </div>
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
        <div
          className="h-1 rounded-full transition-all duration-300"
          style={{ width: `${(idx / questions.length) * 100}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }}
        />
      </div>

      {/* Question */}
      <p className="text-sm font-medium leading-relaxed pt-1" style={{ color: 'var(--text-primary)' }}>
        {q.questionText}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map(opt => {
          let bg     = 'rgba(255,255,255,0.03)'
          let border = 'var(--border-color)'
          let txt    = 'var(--text-secondary)'
          if (answered) {
            if (opt.isCorrect)          { bg = 'rgba(34,197,94,0.1)'; border = 'rgba(34,197,94,0.35)'; txt = '#4ade80' }
            else if (opt.id === selected) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.35)'; txt = '#f87171' }
          } else {
            // hover handled by inline style only; use cursor
          }
          return (
            <button
              key={opt.id}
              onClick={() => pick(opt.id)}
              disabled={answered}
              className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                color: txt,
                cursor: answered ? 'default' : 'pointer',
              }}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{opt.text}</span>
                {answered && opt.isCorrect   && <CheckCircle size={15} className="shrink-0 text-emerald-400" />}
                {answered && opt.id === selected && !opt.isCorrect && <XCircle size={15} className="shrink-0 text-red-400" />}
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className="p-3 rounded-xl text-sm leading-relaxed"
          style={{
            background: correct ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
            border: `1px solid ${correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: 'var(--text-secondary)',
          }}
        >
          <span className="font-semibold" style={{ color: correct ? '#4ade80' : '#f87171' }}>
            {correct ? 'Richtig! ' : 'Falsch. '}
          </span>
          {q.explanation}
        </div>
      )}

      {/* Next */}
      {answered && (
        <button
          onClick={next}
          className="flex items-center gap-2 justify-center w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
        >
          {idx < questions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  )
}
