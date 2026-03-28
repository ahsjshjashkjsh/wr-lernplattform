'use client'
import { useState } from 'react'
import { Dumbbell, Check, GraduationCap } from 'lucide-react'
import { BookingTrainer, BookingEntry } from '@/components/frw/BookingTrainer'
import { TheoryTrainer, KeyTerm, CorePoint } from '@/components/frw/TheoryTrainer'

type Topic = {
  slug: string
  title: string
  order: number
  entries: BookingEntry[]
  keyTerms: KeyTerm[]
  corePoints: CorePoint[]
}

type Mode = 'buchungen' | 'theorie'

export function TrainerSetup({ topics }: { topics: Topic[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(topics.map(t => t.slug)))
  const [mode, setMode] = useState<Mode>('buchungen')
  const [started, setStarted] = useState(false)

  const toggle = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        if (next.size > 1) next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const selectAll = () => setSelected(new Set(topics.map(t => t.slug)))
  const clearAll  = () => { if (topics.length > 0) setSelected(new Set([topics[0].slug])) }

  const selectedTopics  = topics.filter(t => selected.has(t.slug))
  const selectedEntries = selectedTopics.flatMap(t => t.entries)
  const selectedTerms   = selectedTopics.flatMap(t => t.keyTerms)
  const selectedPoints  = selectedTopics.flatMap(t => t.corePoints)

  const theoryCount  = selectedTerms.length * 2 + selectedPoints.length
  const bookingCount = selectedEntries.length

  if (started) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        {/* Mode header */}
        <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          {mode === 'buchungen'
            ? <><Dumbbell size={15} className="text-indigo-400" /><span className="text-sm font-semibold text-indigo-300">Buchungstrainer</span></>
            : <><GraduationCap size={15} className="text-amber-400" /><span className="text-sm font-semibold text-amber-300">Theorie-Quiz</span></>
          }
        </div>
        {mode === 'buchungen'
          ? <BookingTrainer entries={selectedEntries} />
          : <TheoryTrainer keyTerms={selectedTerms} corePoints={selectedPoints} />
        }
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Mode toggle */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <button
          onClick={() => setMode('buchungen')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={mode === 'buchungen'
            ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }
            : { color: 'var(--text-muted)' }
          }
        >
          <Dumbbell size={14} />
          Buchungen üben
        </button>
        <button
          onClick={() => setMode('theorie')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={mode === 'theorie'
            ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }
            : { color: 'var(--text-muted)' }
          }
        >
          <GraduationCap size={14} />
          Theorie üben
        </button>
      </div>

      {/* Topic checkboxes */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Kapitel auswählen
          </span>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="text-xs hover:text-blue-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Alle</button>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <button onClick={clearAll} className="text-xs hover:text-blue-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Keine</button>
          </div>
        </div>

        {topics.map(t => {
          const active = selected.has(t.slug)
          const count  = mode === 'buchungen' ? t.entries.length : t.keyTerms.length * 2 + t.corePoints.length
          const unit   = mode === 'buchungen' ? 'Buchungen' : 'Theoriefragen'

          return (
            <button
              key={t.slug}
              onClick={() => toggle(t.slug)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: active ? (mode === 'buchungen' ? 'rgba(59,130,246,0.08)' : 'rgba(234,179,8,0.08)') : 'rgba(255,255,255,0.02)',
                border: active
                  ? (mode === 'buchungen' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(234,179,8,0.25)')
                  : '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: active ? (mode === 'buchungen' ? '#3b82f6' : '#f59e0b') : 'rgba(255,255,255,0.06)',
                    border: active ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  {active && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
                <span style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  Kapitel {t.order} · {t.title}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {count} {unit}
              </span>
            </button>
          )
        })}
      </div>

      {/* Summary + Start */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <div>
          {mode === 'buchungen' ? (
            <>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {bookingCount} Buchungssätze ausgewählt
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                ~{Math.round(bookingCount * 2)} verschiedene Fragen pro Runde
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                ~{theoryCount} Theoriefragen
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Begriffe + Merksätze · jede Runde anders
              </p>
            </>
          )}
        </div>
        <button
          onClick={() => setStarted(true)}
          disabled={mode === 'buchungen' ? bookingCount === 0 : theoryCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
          style={{ background: mode === 'buchungen' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          {mode === 'buchungen' ? <Dumbbell size={14} /> : <GraduationCap size={14} />}
          Starten
        </button>
      </div>
    </div>
  )
}
