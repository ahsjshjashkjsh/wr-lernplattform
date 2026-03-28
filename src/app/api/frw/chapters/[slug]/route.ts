import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          bookingEntries: { orderBy: { order: 'asc' } },
          keyTerms:       { orderBy: { order: 'asc' } },
          corePoints:     { orderBy: { order: 'asc' } },
          formulas:       { orderBy: { order: 'asc' } },
          learningGoals:  { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(topic)
}
