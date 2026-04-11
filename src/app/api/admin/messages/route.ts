import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.isAdmin) return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { message, targetUserId, showSender } = await request.json()
  if (!message?.trim()) return Response.json({ error: 'Nachricht fehlt' }, { status: 400 })

  // Absender-Name nachschlagen
  const sender = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })

  // Nachrichten laufen nach 1h ab
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  const msg = await prisma.adminMessage.create({
    data: {
      message: message.trim(),
      targetUserId: targetUserId || null,
      showSender: showSender !== false,
      senderName: sender?.name ?? null,
      senderId: session.userId,
      expiresAt,
    },
  })

  return Response.json({ ok: true, id: msg.id })
}

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const messages = await prisma.adminMessage.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { seenBy: { select: { userId: true } } },
  })

  return Response.json({ messages })
}
