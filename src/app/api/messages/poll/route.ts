import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ messages: [] })

  const userId = session.userId

  // Alle aktiven Nachrichten die für diesen User bestimmt sind (oder alle)
  const messages = await prisma.adminMessage.findMany({
    where: {
      expiresAt: { gt: new Date() },
      OR: [{ targetUserId: null }, { targetUserId: userId }],
      seenBy: { none: { userId } },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (messages.length > 0) {
    // Als gelesen markieren
    await prisma.adminMessageSeen.createMany({
      data: messages.map(m => ({ messageId: m.id, userId })),
      skipDuplicates: true,
    })
  }

  return Response.json({ messages: messages.map(m => ({ id: m.id, message: m.message, showSender: m.showSender, senderName: m.senderName, createdAt: m.createdAt })) })
}
