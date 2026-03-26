import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { TopicIcon } from '@/components/TopicIcon'
import { formatScore } from '@/lib/utils'
import { CheckCircle2, Clock, Circle, Trophy, BookOpen, ArrowRight } from 'lucide-react'

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

  const allChapters = topics.flatMap(t => t.chapters)
  const totalChapters = allChapters.length

  const getProgress = (c: (typeof allChapters)[number]) =>
    Array.isArray(c.progress) ? c.progress[0] ?? null : null

  const completed  = allChapters.filter(c => getProgress(c)?.status === 'completed').length
  const inProgress = allChapters.filter(c => getProgress(c)?.status === 'in_progress').length
  const notStarted = totalChapters - completed - inProgress
  const progressPct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0

  const scores = allChapters
    .filter(c => getProgress(c)?.bestScore != null)
    .map(c => getProgress(c)!.bestScore as number)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  return { topics, totalChapters, completed, inProgress, notStarted, progressPct, avgScore }
}

const PROGRESS_STYLE: Record<string, { icon: typeof CheckCircle2; color: string; dot: string }> = {
  completed:   { icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400' },
  in_progress: { icon: Clock,        color: 'text-blue-400',    dot: 'bg-blue-400' },
  not_started: { icon: Circle,       color: 'text-slate-600',   dot: 'bg-slate-700' },
}

function GradientBar({ value }: { value: number }) {
  const gradient =
    value >= 75 ? 'linear-gradient(90deg, #10b981, #34d399)' :
    value >= 40 ? 'linear-gradient(90deg, #3b82f6, #6366f1)' :
                  'linear-gradient(90deg, #f59e0b, #fbbf24)'
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--divider)', backgroundColor: 'rgba(100,116,139,0.15)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: gradient, boxShadow: value > 0 ? '0 0 8px rgba(99,102,241,0.4)' : 'none' }}
      />
    </div>
  )
}

export default async function ProgressPage() {
  const { topics, totalChapters, completed, inProgress, notStarted, progressPct, avgScore } =
    await getProgressData()

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">

      {/* Header */}
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
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Gesamtfortschritt</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {completed} von {totalChapters} Kapiteln abgeschlossen
              </p>
            </div>
            <div
              className="text-3xl font-extrabold gradient-text-blue"
            >
              {progressPct}%
            </div>
          </div>

          <GradientBar value={progressPct} />

          {/* Mini stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Total',         value: totalChapters, color: 'text-slate-400', bg: 'rgba(100,116,139,0.08)' },
              { label: 'Abgeschlossen', value: completed,     color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)' },
              { label: 'In Bearbeitung', value: inProgress,   color: 'text-blue-400',   bg: 'rgba(59,130,246,0.08)' },
              { label: 'Offen',         value: notStarted,    color: 'text-slate-500',  bg: 'rgba(100,116,139,0.05)' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: '1px solid var(--border-color)' }}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {avgScore !== null && (
            <div className="flex items-center gap-2 mt-4 pt-4 text-sm" style={{ borderTop: '1px solid var(--divider)' }}>
              <Trophy size={14} className="text-amber-400" />
              <span style={{ color: 'var(--text-muted)' }}>Durchschnittlicher Quizscore:</span>
              <span className="font-bold text-amber-400">{formatScore(avgScore)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Per-topic breakdown */}
      {(['wr', 'frw'] as const).map(section => {
        const sectionTopics = topics.filter(t => section === 'frw' ? t.category === 'frw' : t.category !== 'frw')
        if (sectionTopics.length === 0) return null
        return (
        <div key={section} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: section === 'frw' ? 'linear-gradient(180deg,#10b981,#059669)' : 'linear-gradient(180deg,#3b82f6,#6366f1)' }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: section === 'frw' ? '#34d399' : '#93c5fd' }}>
              {section === 'frw' ? 'Finanz- & Rechnungswesen' : 'Wirtschaft & Recht'}
            </h2>
          </div>
          <div className="space-y-4">
        {sectionTopics.map(topic => {
          const getTopicChapterProg = (c: (typeof topic.chapters)[number]) =>
            Array.isArray(c.progress) ? c.progress[0] ?? null : null
          const chaptersCompleted = topic.chapters.filter(c => getTopicChapterProg(c)?.status === 'completed').length
          const chaptersTotal = topic.chapters.length
          const topicPct = chaptersTotal > 0 ? Math.round((chaptersCompleted / chaptersTotal) * 100) : 0

          return (
            <div key={topic.id} className="glass rounded-2xl overflow-hidden">
              {/* Topic header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--icon-bg)' }}
                  >
                    <TopicIcon name={topic.icon} size={17} className="text-slate-300" />
                  </div>
                  <div>
                    <Link
                      href={`/topics/${topic.slug}`}
                      className="font-semibold text-sm hover:text-blue-400 transition-colors flex items-center gap-1 group"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {topic.title}
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {chaptersCompleted}/{chaptersTotal} Kapitel
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-sm font-bold ${topicPct >= 75 ? 'text-emerald-400' : topicPct >= 40 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {topicPct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-5 py-2.5">
                <GradientBar value={topicPct} />
              </div>

              {/* Chapter rows */}
              {topic.chapters.length > 0 && (
                <div>
                  {topic.chapters.map(chapter => {
                    const prog = Array.isArray(chapter.progress)
                      ? chapter.progress[0] ?? null
                      : chapter.progress ?? null
                    const status = (prog?.status ?? 'not_started') as keyof typeof PROGRESS_STYLE
                    const style = PROGRESS_STYLE[status] ?? PROGRESS_STYLE.not_started

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
                              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                {chapter.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {prog?.bestScore != null && (
                            <span className="text-xs font-semibold text-amber-400">
                              {formatScore(prog.bestScore)}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <style.icon size={13} className={style.color} />
                          </div>
                          <Link
                            href={`/chapters/${chapter.id}`}
                            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Öffnen
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
        </div>
        )
      })}
    </div>
  )
}
