'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopicIcon } from '@/components/TopicIcon'
import { formatScore } from '@/lib/utils'
import { CheckCircle2, Clock, Circle, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react'

type ChapterRow = {
  id: string
  title: string
  subtitle?: string | null
  status: 'completed' | 'in_progress' | 'not_started'
  bestScore?: number | null
}

export type TopicRow = {
  id: string
  title: string
  slug: string
  icon: string
  chaptersCompleted: number
  chaptersTotal: number
  topicPct: number
  chapters: ChapterRow[]
}

const PROGRESS_STYLE = {
  completed:   { icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400' },
  in_progress: { icon: Clock,        color: 'text-blue-400',    dot: 'bg-blue-400'    },
  not_started: { icon: Circle,       color: 'text-slate-600',   dot: 'bg-slate-700'   },
}

function GradientBar({ value }: { value: number }) {
  const gradient =
    value >= 75 ? 'linear-gradient(90deg, #10b981, #34d399)' :
    value >= 40 ? 'linear-gradient(90deg, #3b82f6, #6366f1)' :
                  'linear-gradient(90deg, #f59e0b, #fbbf24)'
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(100,116,139,0.15)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: gradient, boxShadow: value > 0 ? '0 0 8px rgba(99,102,241,0.4)' : 'none' }}
      />
    </div>
  )
}

export function TopicList({ topics }: { topics: TopicRow[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setOpen(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-4">
      {topics.map(topic => {
        const isOpen = open[topic.id] ?? false

        return (
          <div key={topic.id} className="glass rounded-2xl overflow-hidden">
            {/* Topic header — clickable to expand */}
            <button
              onClick={() => toggle(topic.id)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: isOpen ? '1px solid var(--divider)' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--icon-bg)' }}>
                  <TopicIcon name={topic.icon} size={17} className="text-slate-300" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    {topic.title}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {topic.chaptersCompleted}/{topic.chaptersTotal} Kapitel
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-sm font-bold ${topic.topicPct >= 75 ? 'text-emerald-400' : topic.topicPct >= 40 ? 'text-blue-400' : 'text-amber-400'}`}>
                  {topic.topicPct}%
                </span>
                {isOpen
                  ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }}/>
                  : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }}/>}
              </div>
            </button>

            {/* Progress bar */}
            <div className="px-5 py-2.5" style={{ borderBottom: isOpen ? '1px solid var(--divider)' : 'none' }}>
              <GradientBar value={topic.topicPct} />
            </div>

            {/* Chapter rows — only when open */}
            {isOpen && topic.chapters.length > 0 && (
              <div>
                {topic.chapters.map(chapter => {
                  const style = PROGRESS_STYLE[chapter.status] ?? PROGRESS_STYLE.not_started
                  return (
                    <div
                      key={chapter.id}
                      className="hover-row flex items-center justify-between gap-3 px-5 py-2.5"
                      style={{ borderTop: '1px solid var(--divider)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                        <div className="min-w-0">
                          <Link
                            href={`/chapters/${chapter.id}`}
                            className="text-sm font-medium hover:text-blue-400 transition-colors truncate block"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {chapter.title}
                          </Link>
                          {chapter.subtitle && (
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{chapter.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {chapter.bestScore != null && (
                          <span className="text-xs font-semibold text-amber-400">{formatScore(chapter.bestScore)}</span>
                        )}
                        <style.icon size={13} className={style.color} />
                        <Link href={`/chapters/${chapter.id}`} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                          Öffnen <ArrowRight size={11}/>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
