import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { title: true },
    })

    if (!chapter) {
      return Response.json({ error: 'Chapter not found' }, { status: 404 })
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { chapterId },
      include: {
        options: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    })

    // Shuffle options for each question
    const shuffledQuestions = questions.map(q => ({
      ...q,
      options: shuffleArray(q.options),
    }))

    // Shuffle questions themselves
    const finalQuestions = shuffleArray(shuffledQuestions)

    return Response.json({
      chapterId,
      chapterTitle: chapter.title,
      questions: finalQuestions,
    })
  } catch (error) {
    console.error('GET /api/quiz/[chapterId] error:', error)
    return Response.json({ error: 'Failed to fetch quiz questions' }, { status: 500 })
  }
}
