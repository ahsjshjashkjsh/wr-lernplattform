import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    const userId = session?.userId ?? null

    const progress = await prisma.chapterProgress.findMany({
      where: userId ? { userId } : { userId: null },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            topicId: true,
            topic: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    })
    return Response.json({ progress })
  } catch (error) {
    console.error('GET /api/progress error:', error)
    return Response.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId ?? null

    const body = await request.json()
    const { chapterId, status, bestScore } = body as {
      chapterId: string
      status?: string
      bestScore?: number
    }

    if (!chapterId) {
      return Response.json({ error: 'chapterId is required' }, { status: 400 })
    }

    const existing = await prisma.chapterProgress.findUnique({
      where: { chapterId_userId: { chapterId, userId: userId ?? '' } },
    })

    const newBestScore =
      bestScore != null && existing?.bestScore != null
        ? Math.max(existing.bestScore, bestScore)
        : bestScore ?? existing?.bestScore ?? null

    const record = await prisma.chapterProgress.upsert({
      where: { chapterId_userId: { chapterId, userId: userId ?? '' } },
      create: {
        chapterId,
        userId,
        status: status ?? 'in_progress',
        bestScore: newBestScore,
        lastVisited: new Date(),
      },
      update: {
        ...(status ? { status } : {}),
        ...(newBestScore != null ? { bestScore: newBestScore } : {}),
        lastVisited: new Date(),
      },
    })

    return Response.json({ record })
  } catch (error) {
    console.error('POST /api/progress error:', error)
    return Response.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
