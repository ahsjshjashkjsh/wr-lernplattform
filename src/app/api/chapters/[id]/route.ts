import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        topic: true,
        learningGoals: { orderBy: { order: 'asc' } },
        keyTerms: { orderBy: { order: 'asc' } },
        corePoints: { orderBy: { order: 'asc' } },
        examples: { orderBy: { order: 'asc' } },
        quizQuestions: { select: { id: true } },
        progress: true,
      },
    })

    if (!chapter) {
      return Response.json({ error: 'Chapter not found' }, { status: 404 })
    }

    return Response.json({ chapter })
  } catch (error) {
    console.error('GET /api/chapters/[id] error:', error)
    return Response.json({ error: 'Failed to fetch chapter' }, { status: 500 })
  }
}
