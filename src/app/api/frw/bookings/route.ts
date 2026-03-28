import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slugsParam = searchParams.get('slugs')

  const slugFilter = slugsParam
    ? slugsParam.split(',').filter(Boolean)
    : null

  const topics = await prisma.topic.findMany({
    where: {
      category: 'frw',
      ...(slugFilter ? { slug: { in: slugFilter } } : {}),
    },
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

  const result = topics.map(t => ({
    slug: t.slug,
    title: t.title,
    order: t.order,
    entries: t.chapters[0]?.bookingEntries ?? [],
  }))

  return NextResponse.json(result)
}
