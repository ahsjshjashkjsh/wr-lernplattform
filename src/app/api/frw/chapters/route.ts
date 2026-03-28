import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const topics = await prisma.topic.findMany({
    where: { category: 'frw' },
    orderBy: { order: 'asc' },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { bookingEntries: true, keyTerms: true, formulas: true },
          },
        },
      },
    },
  })
  return NextResponse.json(topics)
}
