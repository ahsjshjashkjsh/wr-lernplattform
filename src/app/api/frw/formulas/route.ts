import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chapterId = searchParams.get('chapterId')

  const formulas = await prisma.formula.findMany({
    where: chapterId ? { chapterId } : {},
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

  return NextResponse.json(formulas)
}
