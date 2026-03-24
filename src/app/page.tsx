import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { TopicIcon } from '@/components/TopicIcon'
import { EXAM_LABELS, CATEGORY_LABELS } from '@/lib/utils'
import type { Topic } from '@/types'
import { ArrowRight, BookOpen, CheckCircle2, Flame, Sparkles, Calculator } from 'lucide-react'

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

const CATEGORY_STYLE: Record<string, { dot: string; badge: string; glow: string }> = {
  bwl:   { dot: 'bg-blue-400',    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',    glow: 'rgba(59,130,246,0.15)' },
  vwl:   { dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', glow: 'rgba(16,185,129,0.15)' },
  recht: { dot: 'bg-violet-400',  badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20', glow: 'rgba(139,92,246,0.15)' },
}

const EXAM_DARK: Record<string, string> = {
  querschnitt: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
  abschluss:   'text-amber-400 bg-amber-500/10 border border-amber-500/20',
  both:        'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
}

function TopicRow({ topic }: { topic: Topic & { chapters: { id: string }[] } }) {
  const examLabel = EXAM_LABELS[topic.examType as keyof typeof EXAM_LABELS] ?? topic.examType
  const examClass = EXAM_DARK[topic.examType] ?? EXAM_DARK.both
  const chapterCount = (topic as any).chapters?.length ?? 0

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="glass glass-hover group flex items-center gap-4 px-4 py-3.5 rounded-xl"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <TopicIcon name={topic.icon} size={17} className="text-slate-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors truncate">
          {topic.title}
        </div>
        <div className="text-xs text-slate-500 truncate mt-0.5">{topic.description}</div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${examClass}`}>
          {examLabel}
        </span>
        <span className="text-slate-600 text-xs hidden sm:block">{chapterCount} Kap.</span>
        <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const { topics, totalChapters, completed, inProgress, avgScore } = await getDashboardData()

  const byCategory = CATEGORY_ORDER.map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    style: CATEGORY_STYLE[cat],
    topics: topics.filter(t => t.category === cat),
  })).filter(g => g.topics.length > 0)

  const progressPct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0

  return (
    <div className="space-y-8 fade-in">

      {/* Hero */}
      <div
        className="relative rounded-2xl p-8 overflow-hidden border"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(139,92,246,0.06) 100%)',
          borderColor: 'rgba(99,102,241,0.2)',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4">
            <Sparkles size={11} />
            HMS Handelsmittelschule Schweiz
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2 gradient-text">
            HMS-Plattform
          </h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Strukturierte Prüfungsvorbereitung mit Kapiteln, Quizzes und KI-Assistent.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <Link
              href="/topics"
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 4px 20px -4px rgba(99,102,241,0.5)',
              }}
            >
              Alle Themen <ArrowRight size={14} />
            </Link>
            <Link
              href="/assistant"
              className="flex items-center gap-2 text-sm font-medium text-slate-300 px-4 py-2.5 rounded-xl glass glass-hover"
            >
              <Sparkles size={14} className="text-violet-400" /> KI-Assistent
            </Link>
          </div>
        </div>
      </div>

      {/* FRW Teaser — prominent */}
      <Link
        href="/buchungssaetze"
        className="relative rounded-2xl overflow-hidden border block group transition-transform hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)',
          borderColor: 'rgba(16,185,129,0.4)',
          boxShadow: '0 0 40px rgba(16,185,129,0.15)',
        }}
      >
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(52,211,153,0.2) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.8) 0%, transparent 70%)', transform: 'translate(-20%, 40%)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 p-6 sm:p-8">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
          >
            <Calculator size={30} className="text-emerald-300" />
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#6ee7b7', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Calculator size={10} /> FRW — Nicht fertig, aber benutzbar
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              Buchungssätze üben — jetzt neu!
            </h2>
            <p className="text-emerald-200 text-sm leading-relaxed max-w-md">
              Interaktive Karteikarten zu Warenkonten, MwSt., Löhnen, Abschreibungen und mehr. Weitere FRW-Themen folgen laufend.
            </p>
          </div>

          {/* Arrow */}
          <div className="shrink-0 flex items-center gap-2 text-emerald-300 font-semibold text-sm group-hover:translate-x-1 transition-transform">
            Jetzt üben <ArrowRight size={16} />
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Kapitel', value: totalChapters, icon: BookOpen, color: 'text-blue-400', glow: 'rgba(59,130,246,0.2)' },
          { label: 'Erledigt', value: completed, icon: CheckCircle2, color: 'text-emerald-400', glow: 'rgba(16,185,129,0.2)' },
          { label: 'Aktiv', value: inProgress, icon: Flame, color: 'text-amber-400', glow: 'rgba(245,158,11,0.2)' },
          { label: 'Ø Score', value: avgScore > 0 ? `${avgScore}%` : '–', icon: Sparkles, color: 'text-violet-400', glow: 'rgba(139,92,246,0.2)' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <s.icon size={18} className={`${s.color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalChapters > 0 && (
        <div className="glass rounded-xl px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Gesamtfortschritt</span>
            <span className="text-xs font-bold text-blue-400">{progressPct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                boxShadow: '0 0 12px rgba(99,102,241,0.5)',
              }}
            />
          </div>
        </div>
      )}

      {/* Topics by category */}
      <div className="space-y-6">
        {byCategory.map(({ cat, label, style, topics: catTopics }) => (
          <div key={cat}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-2 h-2 rounded-full ${style.dot}`} style={{ boxShadow: `0 0 8px ${style.glow}` }} />
              <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">{label}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.badge}`}>
                {catTopics.length}
              </span>
            </div>
            <div className="space-y-2">
              {catTopics.map(topic => (
                <TopicRow key={topic.id} topic={topic as any} />
              ))}
            </div>
          </div>
        ))}

        {/* FRW Section */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Finanz- & Rechnungswesen</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/20">
              In Bearbeitung
            </span>
          </div>
          <div className="space-y-2">
            <Link
              href="/buchungssaetze"
              className="glass glass-hover group flex items-center gap-4 px-4 py-3.5 rounded-xl"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <Calculator size={17} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors truncate">
                  Buchungssätze üben
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">Karteikarten & Quiz zu allen FRW-Buchungssätzen</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                  Verfügbar
                </span>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between gap-4 border"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.6))',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <div>
          <div className="font-bold text-white text-lg">Bereit für ein Quiz?</div>
          <div className="text-slate-400 text-sm mt-0.5">Teste dein Wissen und bereite dich optimal vor.</div>
        </div>
        <Link
          href="/topics"
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl whitespace-nowrap transition-all glow-blue-sm"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
        >
          Starten <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
