import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
    return Response.json({ feedback })
  } catch (error) {
    console.error('GET /api/feedback error:', error)
    return Response.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, message, category } = await request.json() as {
      title: string
      message: string
      category: string
    }

    if (!title?.trim() || !message?.trim()) {
      return Response.json({ error: 'Titel und Nachricht sind erforderlich.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.userId,
        userName: user?.name ?? 'Unbekannt',
        title: title.trim(),
        message: message.trim(),
        category: category ?? 'general',
        status: 'pending',
      },
    })
    return Response.json({ feedback })
  } catch (error) {
    console.error('POST /api/feedback error:', error)
    return Response.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

    const { id, status, adminNote } = await request.json() as {
      id: string
      status: 'accepted' | 'rejected'
      adminNote?: string
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status, adminNote: adminNote ?? null },
    })
    return Response.json({ feedback })
  } catch (error) {
    console.error('PATCH /api/feedback error:', error)
    return Response.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}
