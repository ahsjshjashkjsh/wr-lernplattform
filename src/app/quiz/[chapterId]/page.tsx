'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { getGrade } from '@/lib/utils'
import type { QuizQuestion, QuizOption } from '@/types'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, ChevronLeft, Lightbulb, Trophy, BookOpen } from 'lucide-react'

interface Props {
  params: Promise<{ chapterId: string }>
}

type AnswerState = {
  selectedOptionId: string
  isCorrect: boolean
}

export default function QuizPage({ params }: Props) {
  const { chapterId } = use(params)

  const [questions, setQuestions]     = useState<QuizQuestion[]>([])
  const [chapterTitle, setChapterTitle] = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [currentIdx, setCurrentIdx]   = useState(0)
  const [answers, setAnswers]         = useState<Record<string, AnswerState>>({})
  const [revealed, setRevealed]       = useState(false)
  const [finished, setFinished]       = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => {
    fetch(`/api/quiz/${chapterId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setQuestions(data.questions ?? [])
          setChapterTitle(data.chapterTitle ?? '')
        }
        setLoading(false)
      })
      .catch(() => { setError('Fragen konnten nicht geladen werden.'); setLoading(false) })
  }, [chapterId])

  const currentQuestion = questions[currentIdx]
  const totalQ          = questions.length
  const answeredIds     = Object.keys(answers)
  const correctQ        = Object.values(answers).filter(a => a.isCorrect).length
  const scorePercent    = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0

  function selectOption(option: QuizOption) {
    if (revealed) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { selectedOptionId: option.id, isCorrect: option.isCorrect },
    }))
    setRevealed(true)
  }

  async function nextQuestion() {
    if (currentIdx + 1 >= totalQ) {
      setFinished(true)
      setSubmitting(true)
      try {
        await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId, totalQ, correctQ, scorePercent,
            answers: Object.entries(answers).map(([questionId, a]) => ({
              questionId,
              selectedOptionId: a.selectedOptionId,
              isCorrect: a.isCorrect,
            })),
          }),
        })
      } catch { /* ignore */ }
      finally { setSubmitting(false) }
    } else {
      setCurrentIdx(prev => prev + 1)
      setRevealed(false)
    }
  }

  function restart() {
    setCurrentIdx(0); setAnswers({}); setRevealed(false); setFinished(false)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: '#6366f1' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fragen werden geladen…</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 glass rounded-2xl p-8 text-center">
        <XCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{error}</p>
        <Link href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm transition-colors">
          Zurück zum Dashboard
        </Link>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (totalQ === 0) {
    return (
      <div className="max-w-md mx-auto mt-12 glass rounded-2xl p-10 text-center">
        <BookOpen size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Keine Quizfragen vorhanden</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Für dieses Kapitel gibt es noch keine Fragen.</p>
        <Link
          href={`/chapters/${chapterId}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
        >
          Zurück zum Kapitel
        </Link>
      </div>
    )
  }

  // ── Finished ─────────────────────────────────────────────────────────────
  if (finished) {
    const grade = getGrade(scorePercent)
    const messages: Record<string, string> = {
      '6':   'Ausgezeichnet! Du hast das Kapitel perfekt gemeistert!',
      '5':   'Sehr gut! Du kennst den Stoff sehr gut.',
      '4.5': 'Gut! Mit etwas mehr Übung schaffst du die Bestnote.',
      '4':   'Genügend. Wiederhole die schwierigen Stellen nochmals.',
      '3':   'Noch nicht genügend. Lies das Kapitel nochmals durch.',
    }
    const feedbackColor =
      scorePercent >= 75 ? { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#34d399' } :
      scorePercent >= 50 ? { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24' } :
                           { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  text: '#f87171' }

    return (
      <div className="max-w-lg mx-auto mt-6 fade-in">
        <div className="glass rounded-2xl overflow-hidden">
          {/* Hero */}
          <div
            className="p-8 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.08))' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.2) 0%, transparent 60%)' }}
            />
            <div className="relative z-10">
              <Trophy
                size={48}
                className="mx-auto mb-3"
                style={{ color: scorePercent >= 75 ? '#fbbf24' : scorePercent >= 50 ? '#94a3b8' : '#475569' }}
              />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quiz abgeschlossen!</h2>
              {chapterTitle && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{chapterTitle}</p>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Score grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Ergebnis', value: `${scorePercent}%`, color: 'text-blue-400' },
                { label: 'Note',     value: grade.grade,         color: grade.color },
                { label: 'Richtig',  value: `${correctQ}/${totalQ}`, color: 'text-slate-300' },
              ].map(s => (
                <div
                  key={s.label}
                  className="text-center rounded-xl py-4"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                >
                  <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--divider)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${scorePercent}%`,
                  background: scorePercent >= 75
                    ? 'linear-gradient(90deg,#10b981,#34d399)'
                    : scorePercent >= 50
                    ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                    : 'linear-gradient(90deg,#ef4444,#f87171)',
                  boxShadow: `0 0 10px ${feedbackColor.text}60`,
                }}
              />
            </div>

            {/* Feedback message */}
            <div
              className="rounded-xl p-4"
              style={{ background: feedbackColor.bg, border: `1px solid ${feedbackColor.border}` }}
            >
              <p className="text-sm font-semibold" style={{ color: feedbackColor.text }}>{grade.label}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {messages[grade.grade] ?? 'Gut gemacht!'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={restart}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white py-2.5 rounded-xl transition-all glow-blue-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
              >
                <RotateCcw size={14} /> Nochmals
              </button>
              <Link
                href={`/chapters/${chapterId}`}
                className="flex-1 text-center flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl glass glass-hover transition-all"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={14} /> Kapitel
              </Link>
            </div>

            {submitting && (
              <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Ergebnis wird gespeichert…
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────
  const progressPct  = Math.round((currentIdx / totalQ) * 100)
  const currentAnswer = answers[currentQuestion?.id]
  const LETTERS = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Quiz</h1>
          {chapterTitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{chapterTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {answeredIds.length > 0 && (
            <span className="text-xs font-medium text-emerald-400">
              {correctQ}/{answeredIds.length} richtig
            </span>
          )}
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {currentIdx + 1} / {totalQ}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--divider)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            boxShadow: '0 0 8px rgba(99,102,241,0.5)',
          }}
        />
      </div>

      {/* Question card */}
      {currentQuestion && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Question */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--divider)' }}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shrink-0 text-blue-400"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                {currentIdx + 1}
              </div>
              <p className="text-base font-medium leading-relaxed pt-0.5" style={{ color: 'var(--text-primary)' }}>
                {currentQuestion.questionText}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 space-y-2.5">
            {currentQuestion.options?.map((option, i) => {
              const isSelected = currentAnswer?.selectedOptionId === option.id
              const isCorrect  = option.isCorrect

              let bg = 'var(--bg-surface)'
              let border = 'var(--border-color)'
              let textColor = 'var(--text-secondary)'
              let icon = null

              if (!revealed) {
                // Unselected state — hover handled by className
              } else if (isCorrect) {
                bg = 'rgba(16,185,129,0.10)'
                border = 'rgba(16,185,129,0.4)'
                textColor = '#34d399'
                icon = <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              } else if (isSelected) {
                bg = 'rgba(239,68,68,0.08)'
                border = 'rgba(239,68,68,0.35)'
                textColor = '#f87171'
                icon = <XCircle size={15} className="text-red-400 shrink-0" />
              } else {
                textColor = 'var(--text-muted)'
              }

              return (
                <button
                  key={option.id}
                  onClick={() => selectOption(option)}
                  disabled={revealed}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all duration-150 flex items-center gap-3 disabled:cursor-default group"
                  style={{ background: bg, border: `1px solid ${border}`, color: textColor }}
                  onMouseEnter={e => {
                    if (!revealed) {
                      e.currentTarget.style.background = 'var(--bg-surface-hover)'
                      e.currentTarget.style.borderColor = 'var(--border-hover)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!revealed) {
                      e.currentTarget.style.background = bg
                      e.currentTarget.style.borderColor = border
                    }
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-all"
                    style={
                      revealed && isCorrect
                        ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
                        : revealed && isSelected && !isCorrect
                        ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
                        : { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }
                    }
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="flex-1 text-sm font-medium leading-snug">{option.text}</span>
                  {icon}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {revealed && currentQuestion.explanation && (
            <div
              className="mx-4 mb-4 rounded-xl p-4"
              style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb size={13} className="text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">Erklärung</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next button */}
          {revealed && (
            <div className="px-4 pb-4">
              <button
                onClick={nextQuestion}
                className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm text-white transition-all glow-blue-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
              >
                {currentIdx + 1 >= totalQ ? 'Ergebnis anzeigen' : 'Nächste Frage'}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end">
        <Link
          href={`/chapters/${chapterId}`}
          className="flex items-center gap-1.5 text-xs transition-colors hover:text-blue-400"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={12} /> Abbrechen
        </Link>
      </div>
    </div>
  )
}
