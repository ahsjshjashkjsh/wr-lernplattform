'use client'

import { useState, useMemo } from 'react'
import { Search, X, Lightbulb, BookOpen } from 'lucide-react'
import { MarkdownContent } from '@/components/MarkdownContent'

type Goal       = { id: string; text: string }
type CorePoint  = { id: string; text: string }

type Props = {
  learningGoals: Goal[]
  summary:       string | null
  corePoints?:   CorePoint[]
  accentColor?:  'emerald' | 'blue'
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts   = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            style={{ background: 'rgba(250,204,21,0.3)', color: '#fde68a', borderRadius: '2px', padding: '0 2px' }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export function TheorieTab({ learningGoals, summary, corePoints = [], accentColor = 'blue' }: Props) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const dotClass = accentColor === 'emerald' ? 'bg-emerald-400' : 'bg-blue-400'

  // Split summary into sections for targeted search results
  const sections = useMemo(() => {
    if (!summary) return []
    // Split at ## headings (keep heading with its content)
    const byHeadings = summary.split(/(?=^## )/m).filter(s => s.trim())
    if (byHeadings.length > 1) return byHeadings
    // Fallback: split by blank lines
    return summary.split(/\n{2,}/).filter(s => s.trim())
  }, [summary])

  const filteredGoals    = useMemo(() => q ? learningGoals.filter(g  => g.text.toLowerCase().includes(q)) : learningGoals, [learningGoals, q])
  const filteredSections = useMemo(() => q ? sections.filter(s       => s.toLowerCase().includes(q))      : sections,      [sections, q])
  const filteredPoints   = useMemo(() => q ? corePoints.filter(cp    => cp.text.toLowerCase().includes(q)): corePoints,    [corePoints, q])

  const totalMatches = filteredGoals.length + filteredSections.length + filteredPoints.length

  return (
    <div className="space-y-6">

      {/* ── Search bar ── */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Theorie durchsuchen…"
          className="w-full pl-8 pr-8 py-2 rounded-xl text-sm outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
          onBlur={e   => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Suche leeren"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Result count ── */}
      {q && (
        <p className="text-xs -mt-2" style={{ color: 'var(--text-muted)' }}>
          {totalMatches === 0
            ? 'Kein Treffer gefunden.'
            : `${totalMatches} Abschnitt${totalMatches !== 1 ? 'e' : ''} gefunden`}
        </p>
      )}

      {/* ── Learning goals ── */}
      {filteredGoals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Lernziele
          </h3>
          <ul className="space-y-1.5">
            {filteredGoals.map(g => (
              <li key={g.id} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                <Highlight text={g.text} query={query.trim()} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Summary ── */}
      {summary ? (
        q ? (
          filteredSections.length > 0 && (
            <div className="space-y-1">
              {filteredSections.map((section, i) => (
                <MarkdownContent key={i} text={section} />
              ))}
            </div>
          )
        ) : (
          <MarkdownContent text={summary} />
        )
      ) : (
        !q && (
          <div className="text-center py-12">
            <BookOpen size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Theorie wird noch geladen.</p>
          </div>
        )
      )}

      {/* ── Core Points / Merksätze ── */}
      {filteredPoints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Merksätze
          </h3>
          {filteredPoints.map(cp => (
            <div
              key={cp.id}
              className="flex items-start gap-3 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}
            >
              <Lightbulb size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <span style={{ color: 'var(--text-secondary)' }}>
                <Highlight text={cp.text} query={query.trim()} />
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
