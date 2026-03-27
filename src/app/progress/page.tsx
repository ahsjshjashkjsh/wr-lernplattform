import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatScore } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import ProgressTopics, { type TopicProg, type ChapterProg } from './ProgressTopics'

export const dynamic = 'force-dynamic'

async function getProgressData() {
  const user = await getCurrentUser()
  const userId = user?.id ?? null

  const topics = await prisma.topic.findMany({
    orderBy: { order: 'asc' },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          progress: {
            where: userId ? { userId } : { userId: null },
          },
        },
      },
    },
  })

  const getProgress = <T extends { progress: { status?: string | null; bestScore?: number | null }[] }>(
    c: T
  ) => (Array.isArray(c.progress) ? c.progress[0] ?? null : null)

  const allChapters = topics.flatMap(t => t.chapters)
  const totalChapters = allChapters.length
  const completed  = allChapters.filter(c => getProgress(c)?.status === 'completed').length
  const inProgress = allChapters.filter(c => getProgress(c)?.status === 'in_progress').length
  const notStarted = totalChapters - completed - inProgress
  const progressPct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0

  const scores = allChapters
    .filter(c => getProgress(c)?.bestScore != null)
    .map(c => getProgress(c)!.bestScore as number)
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null

  // Build typed TopicProg[] for WR and FRW
  function buildTopicProgs(sectionTopics: typeof topics): TopicProg[] {
    return sectionTopics.map(topic => {
      const chaptersTotal = topic.chapters.length
      const chaptersCompleted = topic.chapters.filter(
        c => getProgress(c)?.status === 'completed'
      ).length
      const pct = chaptersTotal > 0 ? Math.round((chaptersCompleted / chaptersTotal) * 100) : 0

      const chapters: ChapterProg[] = topic.chapters.map(c => {
        const prog = getProgress(c)
        const rawStatus = prog?.status ?? 'not_started'
        const status: ChapterProg['status'] =
          rawStatus === 'completed' || rawStatus === 'in_progress'
            ? rawStatus
            : 'not_started'
        return {
          id: c.id,
          title: c.title,
          subtitle: c.subtitle ?? null,
          status,
          bestScore: prog?.bestScore ?? null,
        }
      })

      return {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        icon: topic.icon,
        chaptersCompleted,
        chaptersTotal,
        pct,
        chapters,
      }
    })
  }

  const wrTopics  = topics.filter(t => t.category !== 'frw')
  const frwTopics = topics.filter(t => t.category === 'frw')

  const wrTopicProgs  = buildTopicProgs(wrTopics)
  const frwTopicProgs = buildTopicProgs(frwTopics)

  // Section-level stats
  const wrChapters  = wrTopics.flatMap(t => t.chapters)
  const frwChapters = frwTopics.flatMap(t => t.chapters)

  const sectionStats = (chapters: typeof allChapters) => {
    const total = chapters.length
    const done  = chapters.filter(c => getProgress(c)?.status === 'completed').length
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, pct }
  }

  const wrStats  = sectionStats(wrChapters)
  const frwStats = sectionStats(frwChapters)

  return {
    totalChapters, completed, inProgress, notStarted, progressPct, avgScore,
    wrTopicProgs, frwTopicProgs, wrStats, frwStats,
  }
}

function GradientBar({ value, gradient }: { value: number; gradient: string }) {
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: 'rgba(100,116,139,0.15)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: gradient,
          boxShadow: value > 0 ? '0 0 8px rgba(99,102,241,0.4)' : 'none',
        }}
      />
    </div>
  )
}

export default async function ProgressPage() {
  const {
    totalChapters, completed, inProgress, notStarted, progressPct, avgScore,
    wrTopicProgs, frwTopicProgs, wrStats, frwStats,
  } = await getProgressData()

  const overallGradient =
    progressPct >= 75 ? 'linear-gradient(90deg, #10b981, #34d399)' :
    progressPct >= 40 ? 'linear-gradient(90deg, #3b82f6, #6366f1)' :
                        'linear-gradient(90deg, #f59e0b, #fbbf24)'

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text">Lernfortschritt</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Übersicht über alle Kapitel und deinen Fortschritt
        </p>
      </div>

      {/* Overall stats card */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 60%)' }}
        />
        <div className="relative z-10 space-y-5">

          {/* Title + big percentage */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Gesamtfortschritt
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {completed} von {totalChapters} Kapiteln abgeschlossen
              </p>
            </div>
            <div className="text-3xl font-extrabold gradient-text-blue tabular-nums">
              {progressPct}%
            </div>
          </div>

          {/* Overall progress bar */}
          <GradientBar value={progressPct} gradient={overallGradient} />

          {/* 4 mini stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { label: 'Total',         value: totalChapters, colorClass: 'text-slate-400',   bg: 'rgba(100,116,139,0.08)' },
              { label: 'Abgeschlossen', value: completed,     colorClass: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)' },
              { label: 'In Bearbeitung',value: inProgress,    colorClass: 'text-blue-400',    bg: 'rgba(59,130,246,0.08)' },
              { label: 'Offen',         value: notStarted,    colorClass: 'text-slate-500',   bg: 'rgba(100,116,139,0.05)' },
            ] as const).map(s => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: s.bg, border: '1px solid var(--border-color)' }}
              >
                <div className={`text-2xl font-bold tabular-nums ${s.colorClass}`}>{s.value}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section breakdown: WR | FRW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* WR card */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                    Wirtschaft &amp; Recht
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-400 tabular-nums">{wrStats.pct}%</span>
              </div>
              <GradientBar value={wrStats.pct} gradient="linear-gradient(90deg, #3b82f6, #6366f1)" />
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {wrStats.done}/{wrStats.total} Kapitel abgeschlossen
              </p>
            </div>

            {/* FRW card */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                    Finanz- &amp; Rechnungswesen
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">{frwStats.pct}%</span>
              </div>
              <GradientBar value={frwStats.pct} gradient="linear-gradient(90deg, #10b981, #34d399)" />
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {frwStats.done}/{frwStats.total} Kapitel abgeschlossen
              </p>
            </div>
          </div>

          {/* Avg score footer */}
          {avgScore !== null && (
            <div
              className="flex items-center gap-2 pt-4 text-sm"
              style={{ borderTop: '1px solid var(--divider)' }}
            >
              <Trophy size={14} className="text-amber-400" />
              <span style={{ color: 'var(--text-muted)' }}>Durchschnittlicher Quizscore:</span>
              <span className="font-bold text-amber-400">{formatScore(avgScore)}</span>
            </div>
          )}
        </div>
      </div>

      {/* WR section */}
      {wrTopicProgs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-5 rounded-full"
              style={{ background: 'linear-gradient(180deg,#3b82f6,#6366f1)' }}
            />
            <h2
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#93c5fd' }}
            >
              Wirtschaft &amp; Recht
            </h2>
          </div>
          <ProgressTopics topics={wrTopicProgs} accent="blue" />
        </div>
      )}

      {/* FRW section */}
      {frwTopicProgs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-5 rounded-full"
              style={{ background: 'linear-gradient(180deg,#10b981,#059669)' }}
            />
            <h2
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#34d399' }}
            >
              Finanz- &amp; Rechnungswesen
            </h2>
          </div>
          <ProgressTopics topics={frwTopicProgs} accent="emerald" />
        </div>
      )}

    </div>
  )
}
