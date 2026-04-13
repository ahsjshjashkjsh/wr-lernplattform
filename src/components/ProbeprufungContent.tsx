'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { EXAM_SECTIONS, type ExamSection } from '@/data/probeprufung'
import {
  Eye, EyeOff, ChevronDown, ChevronUp,
  Timer, RotateCcw, CheckCircle2,
  Play, Pause, BookOpen, Target, Award,
  ThumbsUp, ThumbsDown, Save,
} from 'lucide-react'

type Rating = 'correct' | 'wrong'

const STORAGE_KEY = 'probeprufung_v1'

interface SavedState {
  revealed: string[]
  ratings: Record<string, Rating>
  totalSecs: number
}

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
      <span className={`text-xs font-mono font-bold tabular-nums`}
        style={{ color: isOver ? '#f87171' : isWarning ? '#fbbf24' : 'var(--text-muted)' }}>
        {isOver ? 'Zeit!' : formatTime(remaining)}
      </span>
    </div>
  )
}

export default function ProbeprufungContent() {
  const [revealed, setRevealed]         = useState<Set<string>>(new Set())
  const [ratings, setRatings]           = useState<Record<string, Rating>>({})
  const [collapsed, setCollapsed]       = useState<Set<string>>(new Set())
  const [activeTimer, setActiveTimer]   = useState<string | null>(null)
  const [totalSecs, setTotalSecs]       = useState(0)
  const [totalRunning, setTotalRunning] = useState(false)
  const [loaded, setLoaded]             = useState(false)
  const [savedAt, setSavedAt]           = useState<number | null>(null)
  const totalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const allQuestions      = EXAM_SECTIONS.flatMap(s => s.questions)
  const countableQs       = allQuestions.filter(q => !q.isIntroText)
  const totalPoints       = EXAM_SECTIONS.reduce((a, s) => a + s.totalPoints, 0)

  const ratedCorrect = countableQs.filter(q => ratings[q.id] === 'correct')
  const ratedWrong   = countableQs.filter(q => ratings[q.id] === 'wrong')
  const ratedCount   = ratedCorrect.length + ratedWrong.length
  const earnedPoints = ratedCorrect.reduce((a, q) => a + q.points, 0)

  // ── Load from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s: SavedState = JSON.parse(raw)
        if (s.revealed)  setRevealed(new Set(s.revealed))
        if (s.ratings)   setRatings(s.ratings)
        if (s.totalSecs) setTotalSecs(s.totalSecs)
      }
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  // ── Save to localStorage whenever state changes ───────────────────────────
  useEffect(() => {
    if (!loaded) return
    const state: SavedState = {
      revealed: [...revealed],
      ratings,
      totalSecs,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    setSavedAt(Date.now())
  }, [revealed, ratings, totalSecs, loaded])

  // ── Total timer ──────────────────────────────────────────────────────────
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
    setRatings({})
    setCollapsed(new Set())
    setActiveTimer(null)
    setTotalRunning(false)
    setTotalSecs(0)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  function toggleReveal(id: string) {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function rateQuestion(id: string, rating: Rating) {
    setRatings(prev => ({ ...prev, [id]: rating }))
    // auto-mark as revealed when rated
    setRevealed(prev => { const n = new Set(prev); n.add(id); return n })
  }

  function clearRating(id: string) {
    setRatings(prev => { const n = { ...prev }; delete n[id]; return n })
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

  const allRated     = ratedCount === countableQs.length
  const progressPct  = countableQs.length > 0 ? (ratedCount / countableQs.length) * 100 : 0
  const hasSavedData = ratedCount > 0 || [...revealed].length > 0

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
          6 Aufgaben · {totalPoints} Punkte · 50 Minuten Richtzeit
        </p>
      </div>

      {/* ── Control Bar ── */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>

        {/* Timer row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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
            <button
              onClick={allRated ? () => { setRevealed(new Set()); setRatings({}) } : revealAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            >
              {allRated ? <><EyeOff size={12} /> Alle verbergen</> : <><Eye size={12} /> Alle aufdecken</>}
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

        {/* Score row */}
        <div className="flex flex-wrap items-center gap-3 pt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <ThumbsUp size={11} />
            <span>{ratedCorrect.length} Richtig</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <ThumbsDown size={11} />
            <span>{ratedWrong.length} Falsch</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
            <span>{earnedPoints} / {totalPoints} Pkt.</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {hasSavedData && (
              <>
                <Save size={11} className="text-green-400" />
                <span>Automatisch gespeichert</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Fortschrittsbalken ── */}
      <div className="space-y-1.5">
        <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--border-color)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${countableQs.length > 0 ? (ratedCorrect.length / countableQs.length) * 100 : 0}%`,
              background: '#22c55e',
            }}
          />
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${countableQs.length > 0 ? (ratedWrong.length / countableQs.length) * 100 : 0}%`,
              background: '#ef4444',
            }}
          />
        </div>
        {/* Abschnitts-Dots */}
        <div className="flex justify-between px-0.5">
          {EXAM_SECTIONS.map(s => {
            const qs = s.questions.filter(q => !q.isIntroText)
            const correct = qs.filter(q => ratings[q.id] === 'correct').length
            const wrong   = qs.filter(q => ratings[q.id] === 'wrong').length
            const rated   = correct + wrong
            const allCorrect = rated === qs.length && wrong === 0
            const hasWrong   = wrong > 0
            const dotColor   = allCorrect ? '#22c55e' : hasWrong ? '#ef4444' : rated > 0 ? '#f59e0b' : 'rgba(255,255,255,0.15)'
            return (
              <div key={s.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full transition-colors" style={{ background: dotColor }} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.number}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Aufgaben ── */}
      {EXAM_SECTIONS.map((section) => {
        const isCollapsed  = collapsed.has(section.id)
        const qs           = section.questions.filter(q => !q.isIntroText)
        const sCorrect     = qs.filter(q => ratings[q.id] === 'correct').length
        const sWrong       = qs.filter(q => ratings[q.id] === 'wrong').length
        const sRated       = sCorrect + sWrong
        const sTimerActive = activeTimer === section.id
        const sAllCorrect  = sRated === qs.length && sWrong === 0
        const sHasWrong    = sWrong > 0

        const borderColor = sAllCorrect
          ? 'rgba(34,197,94,0.25)'
          : sHasWrong
          ? 'rgba(239,68,68,0.2)'
          : 'var(--border-color)'

        const badgeIcon = sAllCorrect ? '✓' : sHasWrong ? '!' : section.number

        return (
          <div key={section.id} className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: `1px solid ${borderColor}` }}>

            {/* Abschnitts-Header */}
            <div className="flex items-center justify-between px-5 py-4 gap-3"
              style={{ borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)' }}>

              <button
                onClick={() => toggleCollapse(section.id)}
                className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{
                    background: sAllCorrect ? 'rgba(34,197,94,0.25)' : sHasWrong ? 'rgba(239,68,68,0.2)' : 'var(--accent)',
                    fontSize: '13px',
                  }}>
                  {badgeIcon}
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
                    {sCorrect > 0 && <span className="text-green-400">{sCorrect} richtig</span>}
                    {sCorrect > 0 && sWrong > 0 && <span> · </span>}
                    {sWrong > 0 && <span className="text-red-400">{sWrong} falsch</span>}
                    {sRated === 0 && <span>{qs.length} Fragen</span>}
                    {sRated > 0 && sRated < qs.length && <span style={{ color: 'var(--text-muted)' }}> · {qs.length - sRated} offen</span>}
                  </p>
                </div>
              </button>

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

                {/* Aufdecken (Abschnitt) */}
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
                  const rating     = ratings[q.id] as Rating | undefined
                  const isIntro    = q.isIntroText === true

                  if (isIntro) {
                    return (
                      <div key={q.id} className="px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-line"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{q.label} </span>
                        {q.question}
                      </div>
                    )
                  }

                  const cardBorder = rating === 'correct'
                    ? 'rgba(34,197,94,0.3)'
                    : rating === 'wrong'
                    ? 'rgba(239,68,68,0.3)'
                    : isRevealed
                    ? 'rgba(99,102,241,0.25)'
                    : 'var(--border-color)'

                  return (
                    <div key={q.id}
                      className={`rounded-xl overflow-hidden transition-all duration-300 ${q.isSubQuestion ? 'ml-5' : ''}`}
                      style={{ border: `1px solid ${cardBorder}` }}>

                      {/* Frage */}
                      <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.025)' }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <span className="text-[11px] font-black mt-0.5 flex-shrink-0 w-6"
                              style={{ color: rating === 'correct' ? '#4ade80' : rating === 'wrong' ? '#f87171' : 'var(--accent)' }}>
                              {q.label}
                            </span>
                            <p className="text-sm leading-relaxed whitespace-pre-line"
                              style={{ color: 'var(--text-primary)' }}>
                              {q.question}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {rating === 'correct' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                                ✓
                              </span>
                            )}
                            {rating === 'wrong' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                                ✗
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                              {q.points} Pkt.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Antwort-Bereich */}
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
                            {/* Musterlösung */}
                            <div className="px-4 py-3" style={{ background: 'rgba(99,102,241,0.04)' }}>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Target size={12} style={{ color: '#818cf8' }} />
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>
                                  Musterlösung
                                </p>
                              </div>
                              <p className="text-sm leading-relaxed whitespace-pre-line"
                                style={{ color: 'var(--text-secondary)' }}>
                                {q.answer}
                              </p>
                            </div>

                            {/* Selbstbewertung */}
                            <div className="px-4 py-3 flex items-center justify-between gap-3"
                              style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.015)' }}>
                              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                Meine Antwort war:
                              </span>
                              {!rating ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => rateQuestion(q.id, 'correct')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
                                  >
                                    <ThumbsUp size={12} /> Richtig
                                  </button>
                                  <button
                                    onClick={() => rateQuestion(q.id, 'wrong')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                                  >
                                    <ThumbsDown size={12} /> Falsch
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                                    style={{
                                      background: rating === 'correct' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                      border: `1px solid ${rating === 'correct' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                                      color: rating === 'correct' ? '#4ade80' : '#f87171',
                                    }}>
                                    {rating === 'correct' ? <><ThumbsUp size={11} /> Richtig</> : <><ThumbsDown size={11} /> Falsch</>}
                                  </span>
                                  <button
                                    onClick={() => clearRating(q.id)}
                                    className="text-[10px] px-2 py-1.5 rounded-lg font-medium"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                                  >
                                    Ändern
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Verbergen */}
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
      {allRated && (
        <div className="rounded-2xl p-6 text-center"
          style={{
            background: ratedWrong.length === 0 ? 'rgba(34,197,94,0.07)' : 'rgba(245,158,11,0.07)',
            border: `1px solid ${ratedWrong.length === 0 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
          }}>
          <Award size={30} className={`mx-auto mb-3 ${ratedWrong.length === 0 ? 'text-green-400' : 'text-amber-400'}`} />
          <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {ratedWrong.length === 0 ? 'Perfekt — alles richtig!' : 'Prüfung abgeschlossen'}
          </p>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            {earnedPoints} / {totalPoints} Punkte · {ratedCorrect.length}/{countableQs.length} Fragen richtig
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Note ca. {earnedPoints / totalPoints >= 0.9 ? '6' : earnedPoints / totalPoints >= 0.75 ? '5' : earnedPoints / totalPoints >= 0.6 ? '4' : earnedPoints / totalPoints >= 0.45 ? '3' : '2'} · Zeit: {formatTime(totalSecs)}
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
