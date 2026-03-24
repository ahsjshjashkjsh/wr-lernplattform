import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface AnswerEntry {
  questionId: string
  selectedOptionId?: string | null
  isCorrect: boolean
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId ?? null

    const body = await request.json()
    const { chapterId, totalQ, correctQ, scorePercent, answers } = body as {
      chapterId: string
      totalQ: number
      correctQ: number
      scorePercent: number
      answers: AnswerEntry[]
    }

    if (!chapterId || typeof totalQ !== 'number' || typeof scorePercent !== 'number') {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Save quiz attempt with answers
    const attempt = await prisma.quizAttempt.create({
      data: {
        chapterId,
        userId,
        totalQ,
        correctQ,
        scorePercent,
        answers: {
          create: (answers ?? []).map((a: AnswerEntry) => ({
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId ?? null,
            isCorrect: a.isCorrect,
          })),
        },
      },
    })

    // Upsert chapter progress
    const existing = await prisma.chapterProgress.findUnique({
      where: { chapterId_userId: { chapterId, userId: userId ?? null } },
    })

    const newBestScore = existing?.bestScore != null
      ? Math.max(existing.bestScore, scorePercent)
      : scorePercent

    const newStatus = scorePercent >= 60 ? 'completed' : 'in_progress'

    await prisma.chapterProgress.upsert({
      where: { chapterId_userId: { chapterId, userId: userId ?? null } },
      create: {
        chapterId,
        userId,
        status: newStatus,
        bestScore: newBestScore,
        lastVisited: new Date(),
      },
      update: {
        status: existing?.status === 'completed' ? 'completed' : newStatus,
        bestScore: newBestScore,
        lastVisited: new Date(),
      },
    })

    return Response.json({ success: true, attemptId: attempt.id })
  } catch (error) {
    console.error('POST /api/quiz/submit error:', error)
    return Response.json({ error: 'Failed to submit quiz' }, { status: 500 })
  }
}
