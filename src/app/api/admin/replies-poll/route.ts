import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) return Response.json({ replies: [] })

  // Nur Antworten auf Nachrichten, die dieser Admin gesendet hat
  const replies = await prisma.adminMessageReply.findMany({
    where: { seenByAdmin: false, message: { senderId: session.userId } },
    orderBy: { createdAt: 'asc' },
    include: {
      message: { select: { message: true, senderName: true } },
    },
  })

  if (replies.length > 0) {
    await prisma.adminMessageReply.updateMany({
      where: { id: { in: replies.map(r => r.id) } },
      data: { seenByAdmin: true },
    })
  }

  return Response.json({
    replies: replies.map(r => ({
      id: r.id,
      userName: r.userName,
      content: r.content,
      originalMessage: r.message.message,
      createdAt: r.createdAt,
    })),
  })
}
