import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Dumbbell } from 'lucide-react'
import { TrainerSetup } from './TrainerSetup'

export const dynamic = 'force-dynamic'

async function getTopicsWithContent() {
  const topics = await prisma.topic.findMany({
    where: { category: 'frw', published: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      order: true,
      chapters: {
        orderBy: { order: 'asc' },
        select: {
          bookingEntries: {
            orderBy: { order: 'asc' },
            select: { id: true, situation: true, sollKonto: true, habenKonto: true, betragHint: true, erklaerung: true },
          },
          keyTerms: {
            orderBy: { order: 'asc' },
            select: { id: true, term: true, definition: true },
          },
          corePoints: {
            orderBy: { order: 'asc' },
            select: { id: true, text: true },
          },
        },
      },
    },
  })

  return topics.map(t => ({
    slug:       t.slug,
    title:      t.title,
    order:      t.order,
    entries:    t.chapters.flatMap(ch => ch.bookingEntries),
    keyTerms:   t.chapters.flatMap(ch => ch.keyTerms),
    corePoints: t.chapters.flatMap(ch => ch.corePoints),
  }))
}

export default async function TrainerPage() {
  const topics = await getTopicsWithContent()
  const usableTopics = topics.filter(t =>
    t.entries.length > 0 || t.keyTerms.length > 0 || t.corePoints.length > 0
  )

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
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Trainer</span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Alle Kapitel trainieren
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Buchungssätze oder Theorie üben — Kapitel frei wählbar. Jede Runde anders.
        </p>
      </div>

      <TrainerSetup topics={usableTopics} />
    </div>
  )
}
