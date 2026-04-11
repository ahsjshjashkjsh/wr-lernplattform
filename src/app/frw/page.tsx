import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'
import Link from 'next/link'
import { ChevronRight, FileText, Hash, Calculator, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'


type Props = {
  searchParams: Promise<{ filter?: string }>
}

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
      where: { category: 'frw', published: true },
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
  const hasPremium = user ? isPremiumActive(user) : false
  return { topics, progressMap, hasPremium }
}

function TopicGrid({
  topics,
  progressMap,
  hasPremium,
}: {
  topics: Awaited<ReturnType<typeof getFrwData>>['topics']
  progressMap: Map<string, string>
  hasPremium: boolean
}) {
  if (topics.length === 0) return (
    <div className="text-center py-12">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Keine Themen gefunden.</p>
    </div>
  )
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map(topic => {
        const ch = topic.chapters[0]
        const kapitelNr = topic.order
        const colors = KAPITEL_COLORS[kapitelNr] ?? KAPITEL_COLORS[3]
        const isLocked = topic.examType === 'abschluss' && !hasPremium
        return (
          <Link
            key={topic.id}
            href={isLocked ? '/premium' : `/frw/${topic.slug}`}
            className="group relative card-link rounded-2xl p-5"
            style={{ opacity: isLocked ? 0.65 : 1 }}
          >
            {isLocked && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                <Lock size={9} />
                Premium
              </div>
            )}
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
                {!isLocked && progressMap.get(ch.id) && (
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

const FILTER_TABS = [
  { id: 'alle', label: 'Alle' },
  { id: 'qsp',  label: 'QSP' },
  { id: 'ap',   label: 'AP' },
]

export default async function FrwPage({ searchParams }: Props) {
  const { filter: rawFilter } = await searchParams
  const filter = rawFilter ?? 'alle'

  const { topics, progressMap, hasPremium } = await getFrwData()

  // Apply filter
  const filteredTopics = topics.filter(t => {
    if (filter === 'qsp') return t.examType === 'querschnitt'
    if (filter === 'ap')  return t.examType === 'abschluss' || t.examType === 'querschnitt'
    return true
  })

  // Split by band
  const band1Topics = filteredTopics.filter(t => t.band === '1')
  const band2Topics = filteredTopics.filter(t => t.band === '2')
  const band3Topics = filteredTopics.filter(t => t.band === '3')
  const bandFallback = filteredTopics.filter(t => !t.band || !['1','2','3'].includes(t.band ?? ''))

  const allBand2 = [...band2Topics, ...bandFallback]

  // Counts per exam type for badges
  const qspCount  = topics.filter(t => t.examType === 'querschnitt').length
  const apCount   = topics.filter(t => t.examType === 'abschluss').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between pt-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-3" style={{ color: 'var(--text-muted)' }}>
            Finanz- &amp; Rechnungswesen
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
          >
            Alle Kapitel
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {topics.length} Themen · direkt aus dem hep-Lehrmittel
          </p>
        </div>
      </div>

      {/* Premium-Banner */}
      <div
        className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--accent-border)' }}
      >
        <span className="shrink-0 text-base" style={{ color: 'var(--accent)' }}>🔒</span>
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>Alle Inhalte sind Premium-pflichtig.</span>
          {' '}Schalte Theorie, Buchungssätze und alle Kapitel für CHF 5 / Monat frei.{' '}
          <a href="/premium" className="underline underline-offset-2 transition-colors" style={{ color: 'var(--accent)' }}>
            Premium holen →
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit min-w-max"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        {FILTER_TABS.map(tab => {

          const isActive = filter === tab.id
          const count = tab.id === 'qsp' ? qspCount : tab.id === 'ap' ? apCount : topics.length
          return (
            <Link
              key={tab.id}
              href={`/frw?filter=${tab.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'text-white shadow-sm' : 'hover:bg-white/5'
              }`}
              style={isActive
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-muted)' }
              }
            >
              {tab.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>
      </div>

      {/* Filter hint */}
      {filter === 'qsp' && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>QSP</span> — Nur diese Themen kommen an der Querschnittsprüfung vor
        </div>
      )}
      {filter === 'ap' && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>AP</span> — An der Abschlussprüfung kommen <strong>alle</strong> Themen vor — QSP-Themen und AP-Themen
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
          <TopicGrid topics={band1Topics} progressMap={progressMap} hasPremium={hasPremium} />
        </div>
      )}

      {/* Band 2 Section */}
      {allBand2.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Band 2 — Vertiefung
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>
          <TopicGrid topics={allBand2} progressMap={progressMap} hasPremium={hasPremium} />
        </div>
      )}

      {/* Band 3 Section */}
      {band3Topics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Band 3 — Abschlusskompetenz
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>
          <TopicGrid topics={band3Topics} progressMap={progressMap} hasPremium={hasPremium} />
        </div>
      )}

      {/* No results */}
      {band1Topics.length === 0 && allBand2.length === 0 && band3Topics.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Keine Themen für diesen Filter.</p>
        </div>
      )}
    </div>
  )
}
