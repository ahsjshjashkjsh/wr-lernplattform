import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            learningGoals: { select: { id: true } },
            quizQuestions: { select: { id: true } },
          },
        },
      },
    })

    if (!topic) {
      return Response.json({ error: 'Topic not found' }, { status: 404 })
    }

    return Response.json({ topic })
  } catch (error) {
    console.error('GET /api/topics/[id] error:', error)
    return Response.json({ error: 'Failed to fetch topic' }, { status: 500 })
  }
}
