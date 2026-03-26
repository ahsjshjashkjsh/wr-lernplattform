'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopicIcon } from '@/components/TopicIcon'
import { EXAM_LABELS, CATEGORY_LABELS } from '@/lib/utils'
import type { Topic } from '@/types'
import { Search, ArrowRight, SlidersHorizontal } from 'lucide-react'

type TopicWithCount = Topic & { _count?: { chapters: number }; chapters?: { id: string }[] }

const FILTER_TABS = [
  { key: 'all',         label: 'Alle' },
  { key: 'querschnitt', label: 'QSP' },
  { key: 'abschluss',   label: 'AP' },
  { key: 'bwl',         label: 'BWL' },
  { key: 'vwl',         label: 'VWL' },
  { key: 'recht',       label: 'Recht' },
] as const

type FilterKey = (typeof FILTER_TABS)[number]['key']

const EXAM_STYLE: Record<string, string> = {
  querschnitt: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
  abschluss:   'text-amber-400 bg-amber-500/10 border border-amber-500/20',
  both:        'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
}

const CATEGORY_GRADIENT: Record<string, string> = {
  bwl:   'from-blue-500/30 to-blue-600/10',
  vwl:   'from-emerald-500/30 to-emerald-600/10',
  recht: 'from-violet-500/30 to-violet-600/10',
}

const CATEGORY_ICON_BG: Record<string, string> = {
  bwl:   'rgba(59,130,246,0.15)',
  vwl:   'rgba(16,185,129,0.15)',
  recht: 'rgba(139,92,246,0.15)',
}

const CATEGORY_ICON_COLOR: Record<string, string> = {
  bwl:   'text-blue-400',
  vwl:   'text-emerald-400',
  recht: 'text-violet-400',
}

function TopicCard({ topic }: { topic: TopicWithCount }) {
  const examLabel = EXAM_LABELS[topic.examType as keyof typeof EXAM_LABELS] ?? topic.examType
  const examClass = EXAM_STYLE[topic.examType] ?? EXAM_STYLE.both
  const catLabel = CATEGORY_LABELS[topic.category] ?? topic.category
  const chapterCount = topic.chapters?.length ?? topic._count?.chapters ?? 0
  const gradient = CATEGORY_GRADIENT[topic.category] ?? 'from-blue-500/30 to-blue-600/10'
  const iconBg = CATEGORY_ICON_BG[topic.category] ?? 'rgba(99,102,241,0.15)'
  const iconColor = CATEGORY_ICON_COLOR[topic.category] ?? 'text-slate-300'

  return (
    <Link href={`/topics/${topic.slug}`} className="glass glass-hover group rounded-2xl overflow-hidden flex flex-col">
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            <TopicIcon name={topic.icon} size={20} className={iconColor} />
          </div>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${examClass}`}>{examLabel}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">{topic.title}</h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{topic.description}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-xs text-slate-500">{chapterCount} Kapitel</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.06]">{catLabel}</span>
            <ArrowRight size={13} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/topics')
      .then(r => r.json())
      .then(data => { setTopics(data.topics ?? data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = topics
    .filter(t => t.category !== 'frw')
    .filter(t => {
      if (filter === 'querschnitt') return t.examType === 'querschnitt' || t.examType === 'both'
      if (filter === 'abschluss')   return t.examType === 'abschluss'   || t.examType === 'both'
      if (filter === 'bwl')   return t.category === 'bwl'
      if (filter === 'vwl')   return t.category === 'vwl'
      if (filter === 'recht') return t.category === 'recht'
      return true
    })
    .filter(t => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || CATEGORY_LABELS[t.category]?.toLowerCase().includes(q)
    })

  return (
    <div className="space-y-8 fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Alle Themen</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading ? 'Lädt…' : `${filtered.length} Themen`}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Thema suchen…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <SlidersHorizontal size={13} className="text-slate-600 mr-1" />
        {FILTER_TABS.map(tab => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                active
                  ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Search size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="font-medium text-slate-300">Keine Themen gefunden</p>
          <p className="text-sm text-slate-500 mt-1">Versuche einen anderen Filter.</p>
          <button onClick={() => { setFilter('all'); setSearch('') }} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(topic => <TopicCard key={topic.id} topic={topic} />)}
        </div>
      )}

    </div>
  )
}
