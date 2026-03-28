import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Dumbbell } from 'lucide-react'
import { TrainerSetup } from './TrainerSetup'

export const dynamic = 'force-dynamic'

async function getTopicsWithBookings() {
  const topics = await prisma.topic.findMany({
    where: { category: 'frw' },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      order: true,
      chapters: {
        take: 1,
        select: {
          bookingEntries: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              situation: true,
              sollKonto: true,
              habenKonto: true,
              betragHint: true,
              erklaerung: true,
            },
          },
        },
      },
    },
  })

  return topics.map(t => ({
    slug: t.slug,
    title: t.title,
    order: t.order,
    entries: t.chapters[0]?.bookingEntries ?? [],
  }))
}

export default async function TrainerPage() {
  const topics = await getTopicsWithBookings()
  const topicsWithEntries = topics.filter(t => t.entries.length > 0)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        href="/frw"
        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-blue-400"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronLeft size={14} />
        FRW Übersicht
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Dumbbell size={16} className="text-indigo-400" />
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Buchungstrainer</span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Alle Kapitel trainieren
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Wähle die Kapitel aus, die du üben möchtest. Jede Runde ist anders zusammengestellt.
        </p>
      </div>

      <TrainerSetup topics={topicsWithEntries} />
    </div>
  )
}
