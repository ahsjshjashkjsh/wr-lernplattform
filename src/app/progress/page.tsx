import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import {
  Calculator, Hash, FileText, Lightbulb, BookOpen,
  Dumbbell, ArrowRight, FunctionSquare, Scale, GraduationCap,
  BarChart2, User,
} from 'lucide-react'
import { ProgressBadge, progressLevel } from '@/components/ProgressBadge'

export const dynamic = 'force-dynamic'

async function getProgressData(userId: string | null) {
  const [frwTopics, wrTopics] = await Promise.all([
    prisma.topic.findMany({
      where: { category: 'frw', published: true },
      orderBy: { order: 'asc' },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { bookingEntries: true, keyTerms: true, corePoints: true, formulas: true },
            },
            progress: userId ? {
              where: { userId },
              take: 1,
              select: { status: true, bestScore: true },
            } : false,
          },
        },
      },
    }),
    prisma.topic.findMany({
      where: { category: { in: ['bwl', 'vwl', 'recht'] }, published: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: {
        chapters: {
          take: 1,
          include: {
            _count: { select: { keyTerms: true, quizQuestions: true } },
            progress: userId ? {
              where: { userId },
              take: 1,
              select: { status: true, bestScore: true },
            } : false,
          },
        },
      },
    }),
  ])

  return { frwTopics, wrTopics }
}

const KAPITEL_COLORS: Record<number, { bg: string; border: string; text: string; bar: string }> = {
  2:  { bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.2)',  text: '#38bdf8', bar: '#0ea5e9' },
  3:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#f87171', bar: '#ef4444' },
  4:  { bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)',  text: '#fb923c', bar: '#f97316' },
  5:  { bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.2)',   text: '#facc15', bar: '#eab308' },
  6:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#4ade80', bar: '#22c55e' },
  7:  { bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.2)',  text: '#2dd4bf', bar: '#14b8a6' },
  8:  { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa', bar: '#3b82f6' },
  9:  { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa', bar: '#8b5cf6' },
  11: { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)',  text: '#f472b6', bar: '#ec4899' },
}

const CAT_LABEL: Record<string, string> = { bwl: 'BWL', vwl: 'VWL', recht: 'Recht' }
const CAT_COLOR: Record<string, string> = { bwl: '#60a5fa', vwl: '#4ade80', recht: '#fb923c' }

export default async function ProgressPage() {
  const user = await getCurrentUser()
  const { frwTopics, wrTopics } = await getProgressData(user?.id ?? null)

  // ── FRW stats ──
  const totalBuchungen  = frwTopics.reduce((s, t) => s + t.chapters.reduce((cs, ch) => cs + ch._count.bookingEntries, 0), 0)
  const totalBegriffe   = frwTopics.reduce((s, t) => s + t.chapters.reduce((cs, ch) => cs + ch._count.keyTerms, 0), 0)
  const totalMerksaetze = frwTopics.reduce((s, t) => s + t.chapters.reduce((cs, ch) => cs + ch._count.corePoints, 0), 0)
  const totalFormeln    = frwTopics.reduce((s, t) => s + t.chapters.reduce((cs, ch) => cs + ch._count.formulas, 0), 0)

  // ── User progress stats ──
  const allFrwChapters  = frwTopics.flatMap(t => t.chapters)
  const frwVisited      = allFrwChapters.filter(ch => (ch as any).progress?.[0]?.status === 'in_progress' || (ch as any).progress?.[0]?.status === 'completed').length
  const frwCompleted    = allFrwChapters.filter(ch => (ch as any).progress?.[0]?.status === 'completed').length

  const allWrChapters   = wrTopics.flatMap(t => t.chapters)
  const wrVisited       = allWrChapters.filter(ch => (ch as any).progress?.[0]?.status === 'in_progress' || (ch as any).progress?.[0]?.status === 'completed').length
  const wrCompleted     = allWrChapters.filter(ch => (ch as any).progress?.[0]?.status === 'completed').length

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={16} className="text-blue-400" />
          <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Übersicht</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Lernübersicht</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Dein Lernstand auf einen Blick — FRW und Wirtschaft &amp; Recht
        </p>
      </div>

      {/* Not logged in hint */}
      {!user && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--text-muted)' }}
        >
          <User size={15} className="text-indigo-400 shrink-0" />
          Melde dich an, um deinen persönlichen Fortschritt zu sehen.
        </div>
      )}

      {/* ─── FRW SECTION ─── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#10b981,#059669)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Finanz- &amp; Rechnungswesen
          </h2>
        </div>

        {/* FRW Summary card */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden mb-4"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left, rgba(16,185,129,0.06) 0%, transparent 60%)' }} />
          <div className="relative z-10 space-y-4">

            {/* User progress bar (only if logged in) */}
            {user && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Dein Fortschritt</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {frwCompleted} abgeschlossen · {frwVisited} besucht · {allFrwChapters.length} total
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full flex rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${(frwCompleted / Math.max(allFrwChapters.length, 1)) * 100}%`, background: 'linear-gradient(90deg,#10b981,#34d399)' }}
                    />
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${((frwVisited - frwCompleted) / Math.max(allFrwChapters.length, 1)) * 100}%`, background: 'rgba(59,130,246,0.5)' }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10b981' }} />Abgeschlossen</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(59,130,246,0.5)' }} />Besucht</span>
                </div>
              </div>
            )}

            {/* Content stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { icon: Hash,           label: 'Buchungssätze', value: totalBuchungen,  color: 'text-blue-400',   bg: 'rgba(59,130,246,0.08)' },
                { icon: FileText,       label: 'Begriffe',      value: totalBegriffe,   color: 'text-violet-400', bg: 'rgba(139,92,246,0.08)' },
                { icon: Lightbulb,      label: 'Merksätze',     value: totalMerksaetze, color: 'text-amber-400',  bg: 'rgba(234,179,8,0.08)'  },
                { icon: FunctionSquare, label: 'Formeln',       value: totalFormeln,    color: 'text-indigo-400', bg: 'rgba(99,102,241,0.08)' },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: s.bg, border: '1px solid var(--border-color)' }}>
                    <Icon size={13} className={`${s.color} shrink-0`} />
                    <div>
                      <div className={`text-sm font-bold tabular-nums ${s.color}`}>{s.value}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* FRW topic list */}
        <div className="space-y-2.5">
          {frwTopics.map(topic => {
            if (topic.chapters.length === 0) return null
            const colors     = KAPITEL_COLORS[topic.order] ?? KAPITEL_COLORS[3]
            // Best progress across all chapters
            const allProgress = topic.chapters.map(ch => (ch as any).progress?.[0] ?? null)
            const bestProgress = allProgress.reduce((best: any, p: any) => {
              if (!best) return p
              if (!p) return best
              const lvl = (x: any) => x?.status === 'completed' ? 2 : x?.status === 'in_progress' ? 1 : 0
              return lvl(p) > lvl(best) ? p : best
            }, null)
            const level    = progressLevel(bestProgress?.status ?? null, bestProgress?.bestScore ?? null)
            const buchungen  = topic.chapters.reduce((s, ch) => s + ch._count.bookingEntries, 0)
            const begriffe   = topic.chapters.reduce((s, ch) => s + ch._count.keyTerms, 0)
            const hasContent = buchungen > 0 || begriffe > 0

            return (
              <div
                key={topic.id}
                className="rounded-2xl p-4"
                style={{ background: 'var(--card-bg)', border: `1px solid ${level >= 3 ? 'rgba(34,197,94,0.2)' : level >= 1 ? 'rgba(59,130,246,0.15)' : 'var(--border-color)'}` }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                    >
                      Kap. {topic.order}
                    </div>
                    <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {topic.title}
                    </h3>
                  </div>
                  {user && (
                    <ProgressBadge status={bestProgress?.status ?? null} bestScore={bestProgress?.bestScore ?? null} />
                  )}
                </div>

                {hasContent && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/frw/${topic.slug}`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-blue-400"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                    >
                      <BookOpen size={11} /> Theorie
                    </Link>
                    {buchungen > 0 && (
                      <Link
                        href={`/frw/${topic.slug}?tab=ueben`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-indigo-400"
                        style={{ background: 'rgba(99,102,241,0.06)', color: 'var(--text-muted)' }}
                      >
                        <Dumbbell size={11} /> Üben
                      </Link>
                    )}
                    {begriffe > 0 && (
                      <Link
                        href={`/frw/${topic.slug}?tab=begriffe`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-violet-400"
                        style={{ background: 'rgba(139,92,246,0.06)', color: 'var(--text-muted)' }}
                      >
                        <FileText size={11} /> Begriffe
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── WR SECTION ─── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-300">
            Wirtschaft &amp; Recht
          </h2>
        </div>

        {/* WR Summary card */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden mb-4"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />
          <div className="relative z-10 space-y-4">

            {user && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Dein Fortschritt</span>
                  <span className="text-xs font-semibold text-blue-400">
                    {wrCompleted} abgeschlossen · {wrVisited} besucht · {allWrChapters.length} total
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full flex rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${(wrCompleted / Math.max(allWrChapters.length, 1)) * 100}%`, background: 'var(--accent)' }}
                    />
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${((wrVisited - wrCompleted) / Math.max(allWrChapters.length, 1)) * 100}%`, background: 'rgba(99,102,241,0.35)' }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#3b82f6' }} />Abgeschlossen</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(99,102,241,0.35)' }} />Besucht</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: FileText,      label: 'Begriffe',    value: wrTopics.reduce((s, t) => s + (t.chapters[0]?._count.keyTerms ?? 0), 0),      color: 'text-violet-400', bg: 'rgba(139,92,246,0.08)' },
                { icon: GraduationCap, label: 'Quiz-Fragen', value: wrTopics.reduce((s, t) => s + (t.chapters[0]?._count.quizQuestions ?? 0), 0), color: 'text-blue-400',   bg: 'rgba(59,130,246,0.08)' },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: s.bg, border: '1px solid var(--border-color)' }}>
                    <Icon size={13} className={`${s.color} shrink-0`} />
                    <div>
                      <div className={`text-sm font-bold tabular-nums ${s.color}`}>{s.value}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* WR topic list */}
        <div className="space-y-2.5">
          {wrTopics.map(topic => {
            const ch = topic.chapters[0]
            if (!ch) return null
            const progress = (ch as any).progress?.[0] ?? null
            const level    = progressLevel(progress?.status ?? null, progress?.bestScore ?? null)
            const begriffe    = ch._count.keyTerms
            const quizFragen  = ch._count.quizQuestions
            const catColor    = CAT_COLOR[topic.category] ?? '#60a5fa'
            const catLabel    = CAT_LABEL[topic.category] ?? topic.category.toUpperCase()

            return (
              <div
                key={topic.id}
                className="rounded-2xl p-4"
                style={{ background: 'var(--card-bg)', border: `1px solid ${level >= 3 ? 'rgba(34,197,94,0.2)' : level >= 1 ? 'rgba(59,130,246,0.15)' : 'var(--border-color)'}` }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="px-2 py-0.5 rounded-md text-xs font-semibold shrink-0"
                      style={{ background: `${catColor}18`, border: `1px solid ${catColor}35`, color: catColor }}
                    >
                      {catLabel}
                    </div>
                    <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {topic.title}
                    </h3>
                  </div>
                  {user && (
                    <ProgressBadge status={progress?.status ?? null} bestScore={progress?.bestScore ?? null} />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/wr/${topic.slug}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-blue-400"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                  >
                    <BookOpen size={11} /> Theorie
                  </Link>
                  {begriffe > 0 && (
                    <Link
                      href={`/wr/${topic.slug}?tab=begriffe`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-violet-400"
                      style={{ background: 'rgba(139,92,246,0.06)', color: 'var(--text-muted)' }}
                    >
                      <FileText size={11} /> Begriffe
                    </Link>
                  )}
                  {quizFragen > 0 && (
                    <Link
                      href={`/wr/${topic.slug}?tab=quiz`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-blue-400"
                      style={{ background: 'rgba(59,130,246,0.06)', color: 'var(--text-muted)' }}
                    >
                      <GraduationCap size={11} /> Quiz
                    </Link>
                  )}
                  {(begriffe > 0 || ch._count.quizQuestions > 0) && (
                    <Link
                      href={`/wr/${topic.slug}?tab=theorie-ueben`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-amber-400"
                      style={{ background: 'rgba(234,179,8,0.06)', color: 'var(--text-muted)' }}
                    >
                      <Dumbbell size={11} /> Üben
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
