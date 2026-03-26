import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chapterId = searchParams.get('chapterId')
  const topicSlug = searchParams.get('topicSlug')

  const where: Record<string, unknown> = {}

  if (chapterId) {
    where.chapterId = chapterId
  } else if (topicSlug) {
    where.chapter = { topic: { slug: topicSlug } }
  }

  const entries = await prisma.bookingEntry.findMany({
    where,
    orderBy: { order: 'asc' },
    include: {
      chapter: {
        select: {
          id: true,
          title: true,
          slug: true,
          topic: { select: { id: true, title: true, slug: true, band: true } },
        },
      },
    },
  })

  return NextResponse.json(entries)
}
