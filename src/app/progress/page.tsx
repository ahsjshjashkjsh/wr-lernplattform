import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatScore } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import { TopicList } from './TopicList'
import type { TopicRow } from './TopicList'

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

export default async function ProgressPage() {
  return (
    <div className="max-w-3xl mx-auto fade-in">
      <div className="glass rounded-2xl p-10 flex flex-col items-center text-center gap-4" style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          🚧
        </div>
        <div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#e4e4ed' }}>Lernfortschritt – In Bearbeitung</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Diese Seite ist noch nicht fertig und wird bald verfügbar sein.
          </p>
        </div>
      </div>
    </div>
  )

  // eslint-disable-next-line no-unreachable
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
              <span className="font-bold text-amber-400">{formatScore(avgScore!)}</span>
            </div>
          )}
        </div>
      </div>

      {/* WIP banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <span style={{ fontSize: 15 }}>⚠️</span>
        <span style={{ color: '#fcd34d' }}>
          <strong>In Bearbeitung</strong> – Die Themen und Kapitel werden laufend ergänzt und aktualisiert.
        </span>
      </div>

      {/* Per-topic breakdown */}
      <TopicList topics={topics.map(topic => {
        const getTopicChapterProg = (c: (typeof topic.chapters)[number]) =>
          Array.isArray(c.progress) ? c.progress[0] ?? null : null
        const chaptersCompleted = topic.chapters.filter(c => getTopicChapterProg(c)?.status === 'completed').length
        const chaptersTotal = topic.chapters.length
        const topicPct = chaptersTotal > 0 ? Math.round((chaptersCompleted / chaptersTotal) * 100) : 0

        return {
          id: topic.id,
          title: topic.title,
          slug: topic.slug,
          icon: topic.icon,
          chaptersCompleted,
          chaptersTotal,
          topicPct,
          chapters: topic.chapters.map(chapter => {
            const prog = Array.isArray(chapter.progress)
              ? chapter.progress[0] ?? null
              : chapter.progress ?? null
            return {
              id: chapter.id,
              title: chapter.title,
              subtitle: chapter.subtitle,
              status: (prog?.status ?? 'not_started') as 'completed' | 'in_progress' | 'not_started',
              bestScore: prog?.bestScore ?? null,
            }
          }),
        } satisfies TopicRow
      })} />
    </div>
  )
}
