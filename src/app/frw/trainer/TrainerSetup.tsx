'use client'
import { useState } from 'react'
import { Dumbbell, Check } from 'lucide-react'
import { BookingTrainer, BookingEntry } from '@/components/frw/BookingTrainer'

type Topic = {
  slug: string
  title: string
  order: number
  entries: BookingEntry[]
}

export function TrainerSetup({ topics }: { topics: Topic[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(topics.map(t => t.slug)))
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
  const clearAll = () => {
    if (topics.length > 0) setSelected(new Set([topics[0].slug]))
  }

  const selectedEntries = topics
    .filter(t => selected.has(t.slug))
    .flatMap(t => t.entries)

  if (started) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <BookingTrainer entries={selectedEntries} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
            <button onClick={selectAll} className="text-xs hover:text-blue-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
              Alle
            </button>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <button onClick={clearAll} className="text-xs hover:text-blue-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
              Keine
            </button>
          </div>
        </div>

        {topics.map(t => {
          const active = selected.has(t.slug)
          return (
            <button
              key={t.slug}
              onClick={() => toggle(t.slug)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: active ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: active ? '#3b82f6' : 'rgba(255,255,255,0.06)',
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
                {t.entries.length} Buchungen
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
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedEntries.length} Buchungssätze ausgewählt
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            ~{Math.round(selectedEntries.length * 2)} verschiedene Fragen pro Runde
          </p>
        </div>
        <button
          onClick={() => setStarted(true)}
          disabled={selectedEntries.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Dumbbell size={14} />
          Starten
        </button>
      </div>
    </div>
  )
}
