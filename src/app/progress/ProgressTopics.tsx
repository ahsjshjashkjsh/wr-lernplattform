'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopicIcon } from '@/components/TopicIcon'
import { formatScore } from '@/lib/utils'
import { CheckCircle2, Clock, Circle, ChevronDown, ArrowRight } from 'lucide-react'

export type ChapterProg = {
  id: string
  title: string
  subtitle?: string | null
  status: 'completed' | 'in_progress' | 'not_started'
  bestScore?: number | null
}

export type TopicProg = {
  id: string
  title: string
  slug: string
  icon: string
  chaptersCompleted: number
  chaptersTotal: number
  pct: number
  chapters: ChapterProg[]
}

type Accent = 'blue' | 'emerald'

const ACCENT_STYLES: Record<Accent, {
  border: string
  dot: string
  barGradient: string
  barGlow: string
  pctColor: string
  iconBg: string
  iconColor: string
  chapterLink: string
}> = {
  blue: {
    border: 'rgba(59,130,246,0.6)',
    dot: 'bg-blue-400',
    barGradient: 'var(--accent)',
    barGlow: 'rgba(99,102,241,0.35)',
    pctColor: 'text-blue-400',
    iconBg: 'rgba(59,130,246,0.1)',
    iconColor: 'text-blue-300',
    chapterLink: 'hover:text-blue-400',
  },
  emerald: {
    border: 'rgba(16,185,129,0.6)',
    dot: 'bg-emerald-400',
    barGradient: 'linear-gradient(90deg, #10b981, #34d399)',
    barGlow: 'rgba(16,185,129,0.35)',
    pctColor: 'text-emerald-400',
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: 'text-emerald-300',
    chapterLink: 'hover:text-emerald-400',
  },
}

const STATUS_CONFIG: Record<ChapterProg['status'], {
  Icon: typeof CheckCircle2
  dotClass: string
  iconClass: string
}> = {
  completed:   { Icon: CheckCircle2, dotClass: 'bg-emerald-400', iconClass: 'text-emerald-400' },
  in_progress: { Icon: Clock,        dotClass: 'bg-blue-400',    iconClass: 'text-blue-400' },
  not_started: { Icon: Circle,       dotClass: 'bg-slate-700',   iconClass: 'text-slate-600' },
}

function TopicBar({ value, accent }: { value: number; accent: Accent }) {
  const a = ACCENT_STYLES[accent]
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden flex-1"
      style={{ background: 'rgba(100,116,139,0.15)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: a.barGradient,
          boxShadow: value > 0 ? `0 0 6px ${a.barGlow}` : 'none',
        }}
      />
    </div>
  )
}

function TopicCard({ topic, accent }: { topic: TopicProg; accent: Accent }) {
  const [open, setOpen] = useState(false)
  const a = ACCENT_STYLES[accent]

  return (
    <div
      className="glass rounded-2xl overflow-hidden transition-shadow duration-200"
      style={{
        borderLeft: `3px solid ${a.border}`,
      }}
    >
      {/* Collapsed header row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left focus:outline-none group"
        style={{ background: 'transparent' }}
        aria-expanded={open}
      >
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: a.iconBg }}
        >
          <TopicIcon name={topic.icon} size={17} className={a.iconColor} />
        </div>

        {/* Title + chapter count */}
        <div className="flex flex-col min-w-0 shrink-0 w-44">
          <span
            className="font-semibold text-sm truncate leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {topic.title}
          </span>
          <span className="text-[11px] mt-0.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {topic.chaptersCompleted}/{topic.chaptersTotal} Kapitel
          </span>
        </div>

        {/* Progress bar */}
        <TopicBar value={topic.pct} accent={accent} />

        {/* Percentage */}
        <span className={`text-sm font-bold shrink-0 w-10 text-right tabular-nums ${a.pctColor}`}>
          {topic.pct}%
        </span>

        {/* Chevron */}
        <span
          className="shrink-0 transition-transform duration-200"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {/* Expanded chapter rows */}
      {open && topic.chapters.length > 0 && (
        <div>
          {topic.chapters.map((chapter) => {
            const cfg = STATUS_CONFIG[chapter.status] ?? STATUS_CONFIG.not_started
            const { Icon } = cfg
            return (
              <div
                key={chapter.id}
                className="flex items-center gap-3 px-5 py-2.5 hover-row transition-colors duration-150"
                style={{ borderTop: '1px solid var(--divider)' }}
              >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`} />

                {/* Title + subtitle */}
                <div className="flex flex-col min-w-0 flex-1">
                  <Link
                    href={`/chapters/${chapter.id}`}
                    className={`text-sm font-medium transition-colors truncate ${a.chapterLink}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {chapter.title}
                  </Link>
                  {chapter.subtitle && (
                    <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {chapter.subtitle}
                    </span>
                  )}
                </div>

                {/* Score */}
                {chapter.bestScore != null && (
                  <span className="text-xs font-semibold text-amber-400 shrink-0 tabular-nums">
                    {formatScore(chapter.bestScore)}
                  </span>
                )}

                {/* Status icon */}
                <Icon size={13} className={`${cfg.iconClass} shrink-0`} />

                {/* Open link */}
                <Link
                  href={`/chapters/${chapter.id}`}
                  className={`text-xs font-medium shrink-0 transition-colors ${a.chapterLink}`}
                  style={{ color: 'var(--text-muted)' }}
                >
                  Öffnen
                  <ArrowRight size={10} className="inline ml-0.5 align-middle" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ProgressTopics({
  topics,
  accent,
}: {
  topics: TopicProg[]
  accent: Accent
}) {
  if (topics.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Keine Themen gefunden.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {topics.map(topic => (
        <TopicCard key={topic.id} topic={topic} accent={accent} />
      ))}
    </div>
  )
}
