import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { chapterId } = await req.json()
  if (!chapterId) return NextResponse.json({ ok: false }, { status: 400 })

  await prisma.chapterProgress.upsert({
    where: { chapterId_userId: { chapterId, userId: session.userId } },
    update: { lastVisited: new Date(), status: 'in_progress' },
    create: { chapterId, userId: session.userId, status: 'in_progress', lastVisited: new Date() },
  })

  return NextResponse.json({ ok: true })
}
