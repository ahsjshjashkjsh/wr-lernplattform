import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { TopicIcon } from '@/components/TopicIcon'
import { EXAM_LABELS, CATEGORY_LABELS } from '@/lib/utils'
import type { Topic } from '@/types'
import { ArrowRight, BookOpen, CheckCircle2, Flame, Sparkles, Calculator, ArrowUpRight } from 'lucide-react'

async function getDashboardData() {
  const user = await getCurrentUser()
  const userId = user?.id

  const [topics, totalChapters, progressRecords] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: { chapters: { select: { id: true } } },
    }),
    prisma.chapter.count(),
    prisma.chapterProgress.findMany({ where: userId ? { userId } : { userId: null } }),
  ])

  const completed = progressRecords.filter(p => p.status === 'completed').length
  const inProgress = progressRecords.filter(p => p.status === 'in_progress').length
  const scores = progressRecords.filter(p => p.bestScore != null).map(p => p.bestScore as number)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  return { topics, totalChapters, completed, inProgress, avgScore }
}

const CATEGORY_ORDER = ['bwl', 'vwl', 'recht']

function TopicRow({ topic }: { topic: Topic & { chapters: { id: string }[] } }) {
  const examLabel = EXAM_LABELS[topic.examType as keyof typeof EXAM_LABELS] ?? topic.examType
  const chapterCount = (topic as any).chapters?.length ?? 0

  const examColors: Record<string, { color: string; bg: string }> = {
    querschnitt: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    abschluss:   { color: 'var(--accent)', bg: 'var(--accent-dim)' },
    both:        { color: 'var(--blue)', bg: 'var(--blue-dim)' },
  }
  const ec = examColors[topic.examType] ?? examColors.both

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-150"
      style={{ border: '1px solid var(--border-color)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border-hover)'
        el.style.background = 'var(--bg-surface)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border-color)'
        el.style.background = 'transparent'
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--bg-surface)' }}
      >
        <TopicIcon name={topic.icon} size={15} className="text-slate-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
          {topic.title}
        </div>
        <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{topic.description}</div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
          style={{ color: ec.color, background: ec.bg }}
        >
          {examLabel}
        </span>
        <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{chapterCount} Kap.</span>
        <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const { topics, totalChapters, completed, inProgress, avgScore } = await getDashboardData()

  const byCategory = CATEGORY_ORDER.map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    topics: topics.filter(t => t.category === cat),
  })).filter(g => g.topics.length > 0)

  const progressPct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0

  const catAccents: Record<string, string> = {
    bwl:   'var(--blue)',
    vwl:   '#22c55e',
    recht: '#a78bfa',
  }

  return (
    <div className="space-y-10 fade-in">

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="pt-2">
        <div className="mb-1 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
          HMS Handelsmittelschule Schweiz
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none mb-4" style={{ color: 'var(--text-primary)' }}>
          HMS-Plattform
        </h1>
        <p className="text-base max-w-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          Strukturierte Prüfungsvorbereitung mit Kapiteln, Quizzes und KI-Assistent — für die Abschlussprüfung H23b.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-150"
            style={{
              background: 'var(--accent)',
              color: '#09090e',
            }}
          >
            Alle Themen <ArrowRight size={14} />
          </Link>
          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            <Sparkles size={13} style={{ color: 'var(--blue)' }} /> KI-Assistent
          </Link>
        </div>

        {/* Inline Stats */}
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {[
            { label: 'Kapitel total', value: totalChapters, icon: BookOpen, color: 'var(--blue)' },
            { label: 'Erledigt', value: completed, icon: CheckCircle2, color: '#22c55e' },
            { label: 'In Bearbeitung', value: inProgress, icon: Flame, color: 'var(--accent)' },
            { label: 'Ø Score', value: avgScore > 0 ? `${avgScore}%` : '–', icon: Sparkles, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon size={14} style={{ color: s.color }} />
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress Bar ───────────────────────────────── */}
      {totalChapters > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Gesamtfortschritt
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{progressPct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: 'var(--accent)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── FRW Teaser ─────────────────────────────────── */}
      <Link
        href="/topics"
        className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-2xl transition-all duration-200"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--green-border)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--bg-surface-hover)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--bg-surface)'
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)' }}
        >
          <Calculator size={22} style={{ color: '#22c55e' }} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase"
              style={{ color: '#22c55e', background: 'var(--green-dim)' }}
            >
              FRW — In Bearbeitung
            </span>
          </div>
          <div className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            Finanz- & Rechnungswesen kommt!
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Bilanz, Erfolgsrechnung, Warenkonten, Abschreibungen und mehr — jetzt in Vorschau ansehen.
          </p>
        </div>

        <div
          className="shrink-0 flex items-center gap-1.5 text-sm font-semibold group-hover:translate-x-1 transition-transform"
          style={{ color: '#22c55e' }}
        >
          Zur Vorschau <ArrowUpRight size={15} />
        </div>
      </Link>

      {/* ── Topics by Category ─────────────────────────── */}
      <div className="space-y-8">
        {byCategory.map(({ cat, label, topics: catTopics }) => (
          <div key={cat}>
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: catAccents[cat] ?? 'var(--text-muted)' }}
                />
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {label}
                </span>
                <span
                  className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ color: catAccents[cat] ?? 'var(--text-muted)', background: 'var(--bg-surface)' }}
                >
                  {catTopics.length}
                </span>
              </div>
              <Link
                href="/topics"
                className="text-xs font-medium flex items-center gap-1 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
              >
                Alle <ArrowRight size={11} />
              </Link>
            </div>

            <div className="space-y-1.5">
              {catTopics.map(topic => (
                <TopicRow key={topic.id} topic={topic as any} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom CTA ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-4 p-6 rounded-2xl"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Bereit für ein Quiz?</div>
          <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Teste dein Wissen und bereite dich optimal vor.
          </div>
        </div>
        <Link
          href="/topics"
          className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl whitespace-nowrap transition-all"
          style={{ background: 'var(--accent)', color: '#09090e' }}
        >
          Starten <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  )
}
