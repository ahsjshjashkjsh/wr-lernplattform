'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { EXAM_SECTIONS } from '@/data/probeprufung'
import {
  Eye, EyeOff, ChevronDown, ChevronUp,
  Timer, RotateCcw, CheckCircle2, ClipboardList,
  Play, Pause,
} from 'lucide-react'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function ProbeprufungPage() {
  const [revealed, setRevealed]   = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [seconds, setSeconds]     = useState(0)
  const [running, setRunning]     = useState(false)
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalQuestions = EXAM_SECTIONS.reduce((a, s) => a + s.questions.length, 0)
  const revealedCount  = revealed.size

  // Timer
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const resetTimer = useCallback(() => {
    setRunning(false)
    setSeconds(0)
  }, [])

  const resetAll = useCallback(() => {
    setRevealed(new Set())
    setCollapsed(new Set())
    resetTimer()
  }, [resetTimer])

  function toggleReveal(id: string) {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function revealAll() {
    setRevealed(new Set(EXAM_SECTIONS.flatMap(s => s.questions.map(q => q.id))))
  }

  function hideAll() {
    setRevealed(new Set())
  }

  const allRevealed = revealedCount === totalQuestions

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">

      {/* Header */}
      <div className="pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-2"
          style={{ color: 'var(--text-muted)' }}>
          Wirtschaft &amp; Recht
        </p>
        <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Probeprüfung
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {totalQuestions} Aufgaben · Beantworte zuerst selbst, dann Antwort aufdecken
        </p>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Timer size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-xl font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {formatTime(seconds)}
            </span>
          </div>
          <button
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: running ? 'rgba(239,68,68,0.8)' : 'var(--accent)' }}
          >
            {running ? <><Pause size={12} /> Stopp</> : <><Play size={12} /> Start</>}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Progress + controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} className={revealedCount > 0 ? 'text-green-400' : ''} />
            <span>{revealedCount} / {totalQuestions} aufgedeckt</span>
          </div>
          <button
            onClick={allRevealed ? hideAll : revealAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            {allRevealed ? <><EyeOff size={12} /> Alle verbergen</> : <><Eye size={12} /> Alle aufdecken</>}
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={12} /> Zurücksetzen
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(revealedCount / totalQuestions) * 100}%`, background: 'var(--accent)' }}
        />
      </div>

      {/* Sections */}
      {EXAM_SECTIONS.map((section) => {
        const isCollapsed = collapsed.has(section.id)
        const sectionRevealed = section.questions.filter(q => revealed.has(q.id)).length
        return (
          <div key={section.id} className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>

            {/* Section Header */}
            <button
              onClick={() => toggleCollapse(section.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.emoji}</span>
                <div>
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {section.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {section.richtzeit && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                        ⏱ Richtzeit: {section.richtzeit}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {sectionRevealed}/{section.questions.length} aufgedeckt
                    </span>
                  </div>
                </div>
              </div>
              {isCollapsed
                ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                : <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
              }
            </button>

            {!isCollapsed && (
              <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border-color)' }}>

                {/* Context / Ausgangslage */}
                {section.context && (
                  <div className="mt-4 px-4 py-3 rounded-xl text-sm leading-relaxed"
                    style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--text-secondary)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: '#818cf8' }}>
                      Ausgangslage
                    </span>
                    {section.context}
                  </div>
                )}

                {/* Questions */}
                {section.questions.map((q) => {
                  const isRevealed = revealed.has(q.id)
                  return (
                    <div key={q.id} className="rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${isRevealed ? 'rgba(34,197,94,0.2)' : 'var(--border-color)'}` }}>

                      {/* Question */}
                      <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-sm leading-relaxed whitespace-pre-line font-medium"
                          style={{ color: 'var(--text-primary)' }}>
                          {q.question}
                        </p>
                      </div>

                      {/* Answer toggle */}
                      <div style={{ borderTop: '1px solid var(--border-color)' }}>
                        {!isRevealed ? (
                          <button
                            onClick={() => toggleReveal(q.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors hover:bg-white/[0.03]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Eye size={13} /> Antwort anzeigen
                          </button>
                        ) : (
                          <div>
                            <div className="px-4 py-3"
                              style={{ background: 'rgba(34,197,94,0.05)' }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4ade80' }}>
                                Lösung
                              </p>
                              <p className="text-sm leading-relaxed whitespace-pre-line"
                                style={{ color: 'var(--text-secondary)' }}>
                                {q.answer}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleReveal(q.id)}
                              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium transition-colors hover:bg-white/[0.03]"
                              style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}
                            >
                              <EyeOff size={12} /> Verbergen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Completion */}
      {revealedCount === totalQuestions && (
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <ClipboardList size={28} className="mx-auto mb-3 text-green-400" />
          <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Alle Antworten aufgedeckt
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Zeit: {formatTime(seconds)}
          </p>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            <RotateCcw size={14} /> Nochmal versuchen
          </button>
        </div>
      )}
    </div>
  )
}
