import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { TopicIcon } from '@/components/TopicIcon'
import { EXAM_LABELS, CATEGORY_LABELS } from '@/lib/utils'
import type { Topic } from '@/types'
import {
  ArrowRight, BookOpen, CheckCircle2, Flame, Sparkles,
  Calculator, TrendingUp, Target, Trophy, ChevronRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

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

  const completed  = progressRecords.filter(p => p.status === 'completed').length
  const inProgress = progressRecords.filter(p => p.status === 'in_progress').length
  const scores     = progressRecords.filter(p => p.bestScore != null).map(p => p.bestScore as number)
  const avgScore   = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const progressPct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0

  // Per-section progress
  const wrTopics  = topics.filter(t => t.category !== 'frw')
  const frwTopics = topics.filter(t => t.category === 'frw')
  const wrIds  = new Set(wrTopics.flatMap(t => t.chapters.map(c => c.id)))
  const frwIds = new Set(frwTopics.flatMap(t => t.chapters.map(c => c.id)))
  const wrDone  = progressRecords.filter(p => p.status === 'completed' && wrIds.has(p.chapterId)).length
  const frwDone = progressRecords.filter(p => p.status === 'completed' && frwIds.has(p.chapterId)).length
  const wrPct   = wrIds.size  > 0 ? Math.round((wrDone  / wrIds.size)  * 100) : 0
  const frwPct  = frwIds.size > 0 ? Math.round((frwDone / frwIds.size) * 100) : 0

  return {
    user, topics, totalChapters,
    completed, inProgress, avgScore, progressPct,
    wrPct, frwPct, wrTotal: wrIds.size, frwTotal: frwIds.size, wrDone, frwDone,
  }
}

const CATEGORY_ORDER = ['bwl', 'vwl', 'recht']

const CATEGORY_STYLE: Record<string, { dot: string; bar: string; badge: string; border: string }> = {
  bwl:   { dot: 'bg-blue-400',    bar: '#3b82f6', badge: 'text-blue-300 bg-blue-500/10 border-blue-500/20',    border: 'rgba(59,130,246,0.15)' },
  vwl:   { dot: 'bg-emerald-400', bar: '#10b981', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20', border: 'rgba(16,185,129,0.15)' },
  recht: { dot: 'bg-violet-400',  bar: '#8b5cf6', badge: 'text-violet-300 bg-violet-500/10 border-violet-500/20', border: 'rgba(139,92,246,0.15)' },
}

const EXAM_DARK: Record<string, string> = {
  querschnitt: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  abschluss:   'text-amber-300 bg-amber-500/10 border-amber-500/20',
  both:        'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
}

function TopicCard({ topic }: { topic: Topic & { chapters: { id: string }[] } }) {
  const examLabel = EXAM_LABELS[topic.examType as keyof typeof EXAM_LABELS] ?? topic.examType
  const examClass = EXAM_DARK[topic.examType] ?? EXAM_DARK.both
  const chapterCount = topic.chapters?.length ?? 0

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="glass glass-hover group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--icon-bg)' }}
      >
        <TopicIcon name={topic.icon} size={15} className="text-slate-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {topic.title}
        </div>
        <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {chapterCount} Kapitel
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${examClass}`}>
          {examLabel}
        </span>
        <ChevronRight size={13} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
      </div>
    </Link>
  )
}

function SectionBar({ label, pct, done, total, gradient, dotColor }: {
  label: string; pct: number; done: number; total: number
  gradient: string; dotColor: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>{done}/{total}</span>
          <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            background: gradient,
            boxShadow: pct > 0 ? `0 0 6px ${gradient.includes('3b82f6') ? 'rgba(99,102,241,0.4)' : 'rgba(16,185,129,0.4)'}` : 'none',
          }}
        />
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const {
    user, topics, totalChapters,
    completed, inProgress, avgScore, progressPct,
    wrPct, frwPct, wrTotal, frwTotal, wrDone, frwDone,
  } = await getDashboardData()

  const firstName = user?.name?.split(' ')[0] ?? null

  const byCategory = CATEGORY_ORDER.map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    style: CATEGORY_STYLE[cat],
    topics: topics.filter(t => t.category === cat),
  })).filter(g => g.topics.length > 0)

  const wrTopics  = topics.filter(t => t.category !== 'frw')
  const frwTopics = topics.filter(t => t.category === 'frw')

  return (
    <div className="space-y-6 fade-in">

      {/* ── HERO ─────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.07) 50%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', transform: 'translate(35%, -35%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 p-7 sm:p-9">
          {/* Top row: badge + launch */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              <Sparkles size={10} />
              HMS · Abschlussprüfung 2026
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f59e0b' }} />
              In Entwicklung · Launch 29. März 22:00
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2 gradient-text">
            {firstName ? `Hallo, ${firstName}.` : 'HMS-Plattform'}
          </h1>
          <p className="text-sm max-w-lg leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
            Deine Lernplattform zur Prüfungsvorbereitung — Kapitel, Quizzes, Buchungssätze und KI-Assistent.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/topics"
              className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 20px -4px rgba(99,102,241,0.55)' }}
            >
              <BookOpen size={14} /> Alle Themen
            </Link>
            <Link
              href="/progress"
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
            >
              <TrendingUp size={14} className="text-blue-400" /> Mein Fortschritt
            </Link>
          </div>
        </div>
      </div>

      {/* ── QUICK ACCESS ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          {
            href: '/topics',
            icon: BookOpen,
            label: 'Alle Themen',
            sub: `${topics.length} Themen`,
            gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            glow: 'rgba(99,102,241,0.3)',
            iconBg: 'rgba(99,102,241,0.15)',
            iconColor: 'text-indigo-300',
          },
          {
            href: '/progress',
            icon: TrendingUp,
            label: 'Fortschritt',
            sub: `${progressPct}% erledigt`,
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            glow: 'rgba(16,185,129,0.3)',
            iconBg: 'rgba(16,185,129,0.12)',
            iconColor: 'text-emerald-300',
          },
          {
            href: '/buchungssaetze',
            icon: Calculator,
            label: 'Buchungssätze',
            sub: 'FRW üben',
            gradient: 'linear-gradient(135deg, #0ea5e9, #0891b2)',
            glow: 'rgba(14,165,233,0.3)',
            iconBg: 'rgba(14,165,233,0.12)',
            iconColor: 'text-sky-300',
          },
          {
            href: '/assistant',
            icon: Sparkles,
            label: 'KI-Assistent',
            sub: 'Fragen stellen',
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            glow: 'rgba(139,92,246,0.3)',
            iconBg: 'rgba(139,92,246,0.12)',
            iconColor: 'text-violet-300',
          },
        ] as const).map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at top left, ${card.glow} 0%, transparent 60%)` }}
            />

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
              style={{ background: card.iconBg }}
            >
              <card.icon size={18} className={card.iconColor} />
            </div>

            <div className="relative z-10">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{card.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sub}</div>
            </div>

            <ArrowRight
              size={13}
              className="absolute bottom-4 right-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-150"
            />
          </Link>
        ))}
      </div>

      {/* ── STATS + PROGRESS CARD ─────────────────────── */}
      <div
        className="rounded-2xl p-5 sm:p-6 space-y-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Lernfortschritt</h2>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {completed} von {totalChapters} Kapiteln abgeschlossen
            </p>
          </div>
          <div className="text-2xl font-extrabold tabular-nums gradient-text-blue">{progressPct}%</div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {([
            { label: 'Kapitel', value: totalChapters, icon: BookOpen,      color: 'text-slate-400',   bg: 'rgba(100,116,139,0.08)' },
            { label: 'Erledigt',  value: completed,    icon: CheckCircle2,  color: 'text-emerald-400', bg: 'rgba(16,185,129,0.07)'  },
            { label: 'Aktiv',     value: inProgress,   icon: Flame,         color: 'text-amber-400',   bg: 'rgba(245,158,11,0.07)'  },
            { label: 'Ø Score',   value: avgScore > 0 ? `${avgScore}%` : '–', icon: Trophy, color: 'text-violet-400', bg: 'rgba(139,92,246,0.07)' },
          ] as const).map(s => (
            <div
              key={s.label}
              className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
              style={{ background: s.bg, border: '1px solid var(--border-color)' }}
            >
              <s.icon size={14} className={`${s.color} shrink-0`} />
              <div>
                <div className={`text-base font-bold tabular-nums ${s.color}`}>{s.value}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WR / FRW bars */}
        <div className="space-y-3 pt-1" style={{ borderTop: '1px solid var(--divider)' }}>
          <SectionBar
            label="Wirtschaft & Recht"
            pct={wrPct} done={wrDone} total={wrTotal}
            gradient="linear-gradient(90deg, #3b82f6, #6366f1)"
            dotColor="bg-blue-400"
          />
          <SectionBar
            label="Finanz- & Rechnungswesen"
            pct={frwPct} done={frwDone} total={frwTotal}
            gradient="linear-gradient(90deg, #10b981, #34d399)"
            dotColor="bg-emerald-400"
          />
        </div>

        <Link
          href="/progress"
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          Detaillierter Fortschritt <ArrowRight size={11} />
        </Link>
      </div>

      {/* ── TOPICS ───────────────────────────────────── */}
      <div className="space-y-6">

        {/* WR Topics */}
        {byCategory.map(({ cat, label, style, topics: catTopics }) => (
          <div key={cat}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.badge}`}>
                {catTopics.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic as any} />
              ))}
            </div>
          </div>
        ))}

        {/* FRW Topics */}
        {(frwTopics.length > 0 || true) && (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Finanz- &amp; Rechnungswesen
              </h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-amber-300 bg-amber-500/10 border-amber-500/20">
                Neu
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {frwTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic as any} />
              ))}
              {/* Buchungssätze always shown */}
              <Link
                href="/buchungssaetze"
                className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                style={{
                  background: 'rgba(16,185,129,0.05)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <Calculator size={15} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-emerald-200 truncate">Buchungssätze üben</div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    Karteikarten & Quiz · FRW
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-emerald-300 bg-emerald-500/10 border-emerald-500/20">
                    Verfügbar
                  </span>
                  <ChevronRight size={13} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM CTA ───────────────────────────────── */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 100%)',
          border: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-blue-400" />
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Bereit für ein Quiz?</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Teste dein Wissen und bereite dich optimal auf die Prüfung vor.
          </p>
        </div>
        <Link
          href="/topics"
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl whitespace-nowrap transition-all shrink-0"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 16px -4px rgba(99,102,241,0.5)' }}
        >
          Thema wählen <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  )
}
