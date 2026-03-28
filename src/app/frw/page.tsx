import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, ChevronRight, FileText, Hash, Calculator } from 'lucide-react'

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

async function getFrwChapters() {
  return prisma.topic.findMany({
    where: { category: 'frw' },
    orderBy: { order: 'asc' },
    include: {
      chapters: {
        include: {
          _count: { select: { bookingEntries: true, keyTerms: true } },
        },
      },
    },
  })
}

export default async function FrwPage() {
  const topics = await getFrwChapters()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator size={18} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">Band 2</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Finanz- &amp; Rechnungswesen
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {topics.length} Kapitel · Alle Inhalte direkt aus dem Lehrmittel
          </p>
        </div>
      </div>

      {/* Chapter Grid */}
      {topics.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Inhalte werden geladen…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => {
            const ch = topic.chapters[0]
            const kapitelNr = topic.order
            const colors = KAPITEL_COLORS[kapitelNr] ?? KAPITEL_COLORS[3]

            return (
              <Link
                key={topic.id}
                href={`/frw/${topic.slug}`}
                className="group relative rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid var(--border-color)`,
                }}
              >
                {/* Kapitel badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: colors.dot }}
                    />
                    Kapitel {kapitelNr}
                  </div>
                  <ChevronRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>

                {/* Title */}
                <h2 className="text-sm font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {topic.title}
                </h2>
                <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
                  {topic.description}
                </p>

                {/* Stats */}
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
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
