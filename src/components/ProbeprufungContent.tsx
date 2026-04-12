'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { EXAM_SECTIONS, type ExamSection } from '@/data/probeprufung'
import {
  Eye, EyeOff, ChevronDown, ChevronUp,
  Timer, RotateCcw, CheckCircle2,
  Play, Pause, BookOpen, Target, Award,
} from 'lucide-react'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function SectionTimer({ minutes, running }: { minutes: number; running: boolean }) {
  const totalSeconds = minutes * 60
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed(e => Math.min(e + 1, totalSeconds)), 1000)
    } else {
      if (ref.current) clearInterval(ref.current)
    }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running, totalSeconds])

  const remaining = totalSeconds - elapsed
  const pct = (elapsed / totalSeconds) * 100
  const isWarning = remaining < 120 && remaining > 0
  const isOver = remaining <= 0

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-7 h-7">
        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
          <circle
            cx="14" cy="14" r="11" fill="none"
            stroke={isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#6366f1'}
            strokeWidth="2.5"
            strokeDasharray={`${2 * Math.PI * 11}`}
            strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      <span className={`text-xs font-mono font-bold tabular-nums ${isOver ? 'text-red-400' : isWarning ? 'text-amber-400' : ''}`}
        style={{ color: isOver ? '#f87171' : isWarning ? '#fbbf24' : 'var(--text-muted)' }}>
        {isOver ? 'Zeit!' : formatTime(remaining)}
      </span>
    </div>
  )
}

export default function ProbeprufungContent() {
  const [revealed, setRevealed]       = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed]     = useState<Set<string>>(new Set())
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [totalSecs, setTotalSecs]     = useState(0)
  const [totalRunning, setTotalRunning] = useState(false)
  const totalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const allQuestions = EXAM_SECTIONS.flatMap(s => s.questions)
  const countableQuestions = allQuestions.filter(q => q.points > 0)
  const totalPoints = EXAM_SECTIONS.reduce((a, s) => a + s.totalPoints, 0)
  const revealedCount = [...revealed].filter(id => countableQuestions.some(q => q.id === id)).length

  useEffect(() => {
    if (totalRunning) {
      totalRef.current = setInterval(() => setTotalSecs(s => s + 1), 1000)
    } else {
      if (totalRef.current) clearInterval(totalRef.current)
    }
    return () => { if (totalRef.current) clearInterval(totalRef.current) }
  }, [totalRunning])

  const resetAll = useCallback(() => {
    setRevealed(new Set())
    setCollapsed(new Set())
    setActiveTimer(null)
    setTotalRunning(false)
    setTotalSecs(0)
  }, [])

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

  function revealSection(section: ExamSection) {
    setRevealed(prev => {
      const next = new Set(prev)
      section.questions.forEach(q => next.add(q.id))
      return next
    })
  }

  function revealAll() {
    setRevealed(new Set(allQuestions.map(q => q.id)))
  }

  const allRevealed = revealedCount === countableQuestions.length
  const progressPct = countableQuestions.length > 0 ? (revealedCount / countableQuestions.length) * 100 : 0

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in pb-12">

      {/* ── Header ── */}
      <div className="pt-2 pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-2"
          style={{ color: 'var(--text-muted)' }}>
          Wirtschaft &amp; Recht · Abschlussprüfung
        </p>
        <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Probeprüfung
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          5 Aufgaben · {totalPoints} Punkte · 50 Minuten Richtzeit
        </p>
      </div>

      {/* ── Gesamt-Timer-Bar ── */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>

        <div className="flex items-center gap-3">
          <Timer size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-xl font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {formatTime(totalSecs)}
          </span>
          <button
            onClick={() => setTotalRunning(r => !r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: totalRunning ? 'rgba(239,68,68,0.75)' : 'var(--accent)' }}
          >
            {totalRunning ? <><Pause size={12} /> Stopp</> : <><Play size={12} /> Start</>}
          </button>
          <button
            onClick={() => { setTotalRunning(false); setTotalSecs(0) }}
            className="p-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={12} />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} className={revealedCount > 0 ? 'text-green-400' : ''} />
            <span>{revealedCount}/{countableQuestions.length} Fragen aufgedeckt</span>
          </div>
          <button
            onClick={allRevealed ? () => setRevealed(new Set()) : revealAll}
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
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* ── Fortschrittsbalken ── */}
      <div className="space-y-1.5">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--accent), #818cf8)' }}
          />
        </div>
        {/* Abschnitts-Dots */}
        <div className="flex justify-between px-0.5">
          {EXAM_SECTIONS.map(s => {
            const sRevealed = s.questions.filter(q => revealed.has(q.id) && q.points > 0).length
            const sTotal = s.questions.filter(q => q.points > 0).length
            const done = sRevealed === sTotal
            return (
              <div key={s.id} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full transition-colors ${done ? 'bg-green-400' : 'bg-white/20'}`} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.number}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Aufgaben ── */}
      {EXAM_SECTIONS.map((section) => {
        const isCollapsed = collapsed.has(section.id)
        const sRevealedCount = section.questions.filter(q => revealed.has(q.id) && q.points > 0).length
        const sTotal = section.questions.filter(q => q.points > 0).length
        const sTimerActive = activeTimer === section.id

        return (
          <div key={section.id} className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: `1px solid ${sRevealedCount === sTotal ? 'rgba(34,197,94,0.2)' : 'var(--border-color)'}` }}>

            {/* Abschnitts-Header */}
            <div className="flex items-center justify-between px-5 py-4 gap-3"
              style={{ borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)' }}>

              {/* Linke Seite — klickbar zum Auf-/Zuklappen */}
              <button
                onClick={() => toggleCollapse(section.id)}
                className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: sRevealedCount === sTotal ? 'rgba(34,197,94,0.25)' : 'var(--accent)', fontSize: '13px' }}>
                  {sRevealedCount === sTotal ? '✓' : section.number}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {section.emoji} {section.title}
                    </h2>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                      {section.richtzeitMinutes} Min.
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                      {section.totalPoints} Pkt.
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {sRevealedCount}/{sTotal} aufgedeckt
                  </p>
                </div>
              </button>

              {/* Rechte Seite — Timer + Collapse-Icon */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <SectionTimer minutes={section.richtzeitMinutes} running={sTimerActive} />
                <button
                  onClick={() => setActiveTimer(t => t === section.id ? null : section.id)}
                  className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: sTimerActive ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.1)',
                    border: `1px solid ${sTimerActive ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`,
                    color: sTimerActive ? '#f87171' : '#818cf8',
                  }}
                >
                  {sTimerActive ? <Pause size={11} /> : <Play size={11} />}
                </button>
                <button onClick={() => toggleCollapse(section.id)} style={{ color: 'var(--text-muted)' }}>
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="px-5 pb-5 space-y-4">

                {/* Ausgangslage */}
                <div className="mt-4 px-4 py-3 rounded-xl text-sm leading-relaxed"
                  style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <BookOpen size={12} style={{ color: '#818cf8' }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>
                      Ausgangslage
                    </span>
                  </div>
                  <p className="whitespace-pre-line" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {section.context}
                  </p>
                </div>

                {/* Alle Aufdecken (Abschnitt) */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Aufgaben
                  </p>
                  <button
                    onClick={() => revealSection(section)}
                    className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  >
                    <Eye size={11} /> Abschnitt aufdecken
                  </button>
                </div>

                {/* Fragen */}
                {section.questions.map((q) => {
                  const isRevealed = revealed.has(q.id)
                  const isIntro = q.points === 0
                  if (isIntro) {
                    return (
                      <div key={q.id} className="px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-line"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{q.label} </span>
                        {q.question}
                      </div>
                    )
                  }

                  return (
                    <div key={q.id}
                      className={`rounded-xl overflow-hidden transition-all duration-300 ${q.isSubQuestion ? 'ml-5' : ''}`}
                      style={{ border: `1px solid ${isRevealed ? 'rgba(34,197,94,0.25)' : 'var(--border-color)'}` }}>

                      {/* Frage */}
                      <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.025)' }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <span className="text-[11px] font-black mt-0.5 flex-shrink-0 w-6"
                              style={{ color: isRevealed ? '#4ade80' : 'var(--accent)' }}>
                              {q.label}
                            </span>
                            <p className="text-sm leading-relaxed whitespace-pre-line"
                              style={{ color: 'var(--text-primary)' }}>
                              {q.question}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isRevealed && (
                              <CheckCircle2 size={13} className="text-green-400" />
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                              {q.points} Pkt.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Antwort-Toggle */}
                      <div style={{ borderTop: '1px solid var(--border-color)' }}>
                        {!isRevealed ? (
                          <button
                            onClick={() => toggleReveal(q.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors hover:bg-white/[0.03]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Eye size={13} /> Musterlösung anzeigen
                          </button>
                        ) : (
                          <div>
                            <div className="px-4 py-3" style={{ background: 'rgba(34,197,94,0.05)' }}>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Target size={12} className="text-green-400" />
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4ade80' }}>
                                  Musterlösung
                                </p>
                              </div>
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

      {/* ── Abschluss-Banner ── */}
      {allRevealed && (
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Award size={30} className="mx-auto mb-3 text-green-400" />
          <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Alle Musterlösungen aufgedeckt
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Zeit: {formatTime(totalSecs)} · {totalPoints} Punkte total
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
