import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { chapterId, scorePercent } = await req.json()
  if (!chapterId || scorePercent == null) return NextResponse.json({ ok: false }, { status: 400 })

  const existing = await prisma.chapterProgress.findUnique({
    where: { chapterId_userId: { chapterId, userId: session.userId } },
  })

  const newBestScore = Math.max(existing?.bestScore ?? 0, scorePercent)

  await prisma.chapterProgress.upsert({
    where: { chapterId_userId: { chapterId, userId: session.userId } },
    update: { status: 'completed', bestScore: newBestScore, lastVisited: new Date() },
    create: { chapterId, userId: session.userId, status: 'completed', bestScore: newBestScore },
  })

  return NextResponse.json({ ok: true, bestScore: newBestScore })
}
