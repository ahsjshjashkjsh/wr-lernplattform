'use client'
import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, RotateCcw, ChevronRight, Lightbulb } from 'lucide-react'

export type KeyTerm = {
  id: string
  term: string
  definition: string
}

export type CorePoint = {
  id: string
  text: string
}

type QuestionType =
  | { kind: 'term_to_def';  term: string; correct: string; options: string[] }
  | { kind: 'def_to_term';  definition: string; correct: string; options: string[] }
  | { kind: 'corepoint';    text: string; correct: string; options: string[] }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickOthers<T>(pool: T[], exclude: T, n: number): T[] {
  return shuffle(pool.filter(x => x !== exclude)).slice(0, n)
}

function buildQuestions(keyTerms: KeyTerm[], corePoints: CorePoint[]): QuestionType[] {
  const questions: QuestionType[] = []
  const allDefs  = keyTerms.map(k => k.definition)
  const allTerms = keyTerms.map(k => k.term)

  for (const kt of keyTerms) {
    // Begriff → Definition
    const wrongDefs = pickOthers(allDefs, kt.definition, 3)
    if (wrongDefs.length >= 1) {
      questions.push({
        kind: 'term_to_def',
        term: kt.term,
        correct: kt.definition,
        options: shuffle([kt.definition, ...wrongDefs]),
      })
    }

    // Definition → Begriff
    const wrongTerms = pickOthers(allTerms, kt.term, 3)
    if (wrongTerms.length >= 1) {
      questions.push({
        kind: 'def_to_term',
        definition: kt.definition,
        correct: kt.term,
        options: shuffle([kt.term, ...wrongTerms]),
      })
    }
  }

  // CorePoints: pick the correct one among 4 random core points
  if (corePoints.length >= 4) {
    const allTexts = corePoints.map(cp => cp.text)
    for (const cp of corePoints) {
      const wrongTexts = pickOthers(allTexts, cp.text, 3)
      if (wrongTexts.length >= 1) {
        // Show first part of text as "stem", ask which full text matches
        const stem = cp.text.length > 60
          ? cp.text.slice(0, 60).trimEnd() + '…'
          : null

        questions.push({
          kind: 'corepoint',
          text: stem ?? cp.text,
          correct: cp.text,
          options: shuffle([cp.text, ...wrongTexts]),
        })
      }
    }
  }

  return shuffle(questions)
}

type Props = {
  keyTerms: KeyTerm[]
  corePoints: CorePoint[]
}

export function TheoryTrainer({ keyTerms, corePoints }: Props) {
  const [questions, setQuestions] = useState<QuestionType[]>(() =>
    buildQuestions(keyTerms, corePoints)
  )
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]

  const handleSelect = useCallback((opt: string) => {
    if (selected !== null) return
    setSelected(opt)
    if (opt === q.correct) setScore(s => s + 1)
  }, [selected, q])

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setSelected(null)
    }
  }, [index, questions.length])

  const handleRestart = useCallback(() => {
    setQuestions(buildQuestions(keyTerms, corePoints))
    setIndex(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }, [keyTerms, corePoints])

  if (keyTerms.length === 0 && corePoints.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Theorieinhalte vorhanden.</p>
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
          style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}
        >
          {emoji}
        </div>
        <div>
          <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Runde abgeschlossen</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {score} von {questions.length} richtig — {pct}%
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: pct >= 80 ? '#22c55e' : pct >= 60 ? '#3b82f6' : '#f59e0b',
              }}
            />
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <RotateCcw size={14} />
          Neue Runde (anders gemischt)
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>Frage {index + 1} / {questions.length}</span>
        <span className="text-amber-400 font-medium">{score} richtig</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-300"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
      >
        {/* Question type label */}
        <div>
          {q.kind === 'term_to_def' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-amber-300" style={{ background: 'rgba(234,179,8,0.15)' }}>
              Was bedeutet dieser Begriff?
            </span>
          )}
          {q.kind === 'def_to_term' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-blue-300" style={{ background: 'rgba(59,130,246,0.15)' }}>
              Welcher Begriff passt?
            </span>
          )}
          {q.kind === 'corepoint' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-300" style={{ background: 'rgba(34,197,94,0.15)' }}>
              Welcher Merksatz ist vollständig korrekt?
            </span>
          )}
        </div>

        {/* Stem */}
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
        >
          {q.kind === 'term_to_def' && q.term}
          {q.kind === 'def_to_term' && (
            <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>{q.definition}</span>
          )}
          {q.kind === 'corepoint' && (
            <span className="font-normal italic" style={{ color: 'var(--text-secondary)' }}>
              <Lightbulb size={13} className="inline text-amber-400 mr-1.5 mb-0.5" />
              {q.text}
            </span>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === opt
            const isCorrect  = opt === q.correct
            const revealed   = selected !== null

            let style: React.CSSProperties = {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }

            if (revealed && isCorrect) {
              style = { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }
            } else if (revealed && isSelected && !isCorrect) {
              style = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }
            } else if (!revealed) {
              style = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={selected !== null}
                className="w-full text-left px-4 py-3 rounded-xl text-sm leading-relaxed transition-all duration-150 flex items-start gap-3 disabled:cursor-default"
                style={style}
              >
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
                  style={{
                    background: revealed && isCorrect ? 'rgba(34,197,94,0.2)' :
                                revealed && isSelected ? 'rgba(239,68,68,0.2)' :
                                'rgba(255,255,255,0.06)',
                  }}
                >
                  {revealed && isCorrect ? <CheckCircle size={12} className="text-emerald-400" /> :
                   revealed && isSelected ? <XCircle size={12} className="text-red-400" /> :
                   String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Next button (only after selection) */}
      {selected !== null && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {index + 1 >= questions.length ? 'Auswertung' : 'Weiter'}
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
