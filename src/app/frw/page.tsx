import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { ChevronRight, FileText, Hash, Calculator, Dumbbell } from 'lucide-react'

export const dynamic = 'force-dynamic'

const KAPITEL_COLORS: Record<number, { bg: string; border: string; text: string; dot: string }> = {
  3:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#f87171', dot: '#ef4444' },
  4:  { bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)',  text: '#fb923c', dot: '#f97316' },
  5:  { bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.2)',   text: '#facc15', dot: '#eab308' },
  6:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#4ade80', dot: '#22c55e' },
  7:  { bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.2)',  text: '#2dd4bf', dot: '#14b8a6' },
  8:  { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa', dot: '#3b82f6' },
  9:  { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa', dot: '#8b5cf6' },
  11: { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)',  text: '#f472b6', dot: '#ec4899' },
}

async function getFrwData() {
  const user = await getCurrentUser()

  const [topics, progressList] = await Promise.all([
    prisma.topic.findMany({
      where: { category: 'frw' },
      orderBy: { order: 'asc' },
      include: {
        chapters: {
          include: {
            _count: { select: { bookingEntries: true, keyTerms: true } },
          },
        },
      },
    }),
    user
      ? prisma.chapterProgress.findMany({
          where: { userId: user.id },
          select: { chapterId: true, status: true },
        })
      : [],
  ])

  const progressMap = new Map(progressList.map(p => [p.chapterId, p.status]))
  return { topics, progressMap }
}

function TopicGrid({
  topics,
  progressMap,
}: {
  topics: Awaited<ReturnType<typeof getFrwData>>['topics']
  progressMap: Map<string, string>
}) {
  if (topics.length === 0) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map(topic => {
        const ch = topic.chapters[0]
        const kapitelNr = topic.order
        const colors = KAPITEL_COLORS[kapitelNr] ?? KAPITEL_COLORS[3]
        return (
          <Link
            key={topic.id}
            href={`/frw/${topic.slug}`}
            className="group relative rounded-2xl p-5 hover:-translate-y-0.5 hover:border-white/20"
            style={{
              background: 'var(--card-bg)',
              border: `1px solid var(--border-color)`,
              transition: 'transform 200ms, border-color 200ms',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
                Kapitel {kapitelNr}
              </div>
              <ChevronRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            <h2 className="text-sm font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-primary)' }}>
              {topic.title}
            </h2>
            <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
              {topic.description}
            </p>
            {ch && (
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                {ch._count.bookingEntries > 0 && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Hash size={11} />
                    {ch._count.bookingEntries} Buchungen
                  </div>
                )}
                {ch._count.keyTerms > 0 && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <FileText size={11} />
                    {ch._count.keyTerms} Begriffe
                  </div>
                )}
                {ch._count.bookingEntries === 0 && ch._count.keyTerms === 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>In Vorbereitung</span>
                )}
                {progressMap.get(ch.id) && (
                  <span
                    className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Besucht
                  </span>
                )}
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default async function FrwPage() {
  const { topics, progressMap } = await getFrwData()
  const band2Topics = topics.filter(t => t.band !== '1')
  const band1Topics  = topics.filter(t => t.band === '1')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator size={18} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">FRW</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Finanz- &amp; Rechnungswesen
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {topics.length} Kapitel · Alle Inhalte direkt aus dem Lehrmittel
          </p>
        </div>
        <Link
          href="/frw/trainer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
        >
          <Dumbbell size={14} />
          Buchungstrainer
        </Link>
      </div>

      {/* Band 2 Section */}
      {band2Topics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Band 2 — Vertiefung
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>
          <TopicGrid topics={band2Topics} progressMap={progressMap} />
        </div>
      )}

      {/* Band 1 Section */}
      {band1Topics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Band 1 — Grundlagen
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>
          <TopicGrid topics={band1Topics} progressMap={progressMap} />
        </div>
      )}
    </div>
  )
}
