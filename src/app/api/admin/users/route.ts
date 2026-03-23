import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return null
  return user
}

// GET — alle User laden
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { quizAttempts: true, progress: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ users })
}

// PATCH — isAdmin togglen
export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const body = await request.json() as { userId: string; isAdmin: boolean }
  if (!body.userId) return Response.json({ error: 'userId fehlt.' }, { status: 400 })

  // Eigenen Admin-Status nicht entfernen
  if (body.userId === admin.id && !body.isAdmin) {
    return Response.json({ error: 'Du kannst deinen eigenen Admin-Status nicht entfernen.' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: { isAdmin: body.isAdmin },
    select: { id: true, name: true, isAdmin: true },
  })

  return Response.json({ user: updated })
}

// DELETE — User löschen
export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return Response.json({ error: 'userId fehlt.' }, { status: 400 })

  if (userId === admin.id) {
    return Response.json({ error: 'Du kannst deinen eigenen Account nicht löschen.' }, { status: 400 })
  }

  await prisma.quizAttemptAnswer.deleteMany({ where: { attempt: { userId } } })
  await prisma.quizAttempt.deleteMany({ where: { userId } })
  await prisma.chapterProgress.deleteMany({ where: { userId } })
  await prisma.user.delete({ where: { id: userId } })

  return Response.json({ success: true })
}
