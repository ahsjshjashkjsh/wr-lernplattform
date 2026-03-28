'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Layers } from 'lucide-react'

type KeyTerm = {
  id: string
  term: string
  definition: string
}

export function FlashcardMode({ keyTerms }: { keyTerms: KeyTerm[] }) {
  const [isActive, setIsActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!isActive) {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setIsActive(true); setIndex(0); setFlipped(false) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-violet-500/10"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}
        >
          <Layers size={12} />
          Karten-Modus
        </button>
      </div>
    )
  }

  const current = keyTerms[index]
  if (!current) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {index + 1} / {keyTerms.length}
        </span>
        <button
          onClick={() => setIsActive(false)}
          className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          Listenansicht
        </button>
      </div>

      {/* Card with 3D flip */}
      <div
        className="relative cursor-pointer"
        style={{ perspective: '1000px', height: '200px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front: Term */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--card-bg)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          >
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Begriff</p>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{current.term}</h3>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Klicken zum Umdrehen</p>
          </div>

          {/* Back: Definition */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          >
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Definition</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{current.definition}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false) }}
          disabled={index === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} /> Zurück
        </button>

        <button
          onClick={() => { setIndex(0); setFlipped(false) }}
          className="p-2 rounded-xl transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
          title="Zurück zum Anfang"
        >
          <RotateCcw size={14} />
        </button>

        <button
          onClick={() => { setIndex(i => Math.min(keyTerms.length - 1, i + 1)); setFlipped(false) }}
          disabled={index === keyTerms.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
        >
          Weiter <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
