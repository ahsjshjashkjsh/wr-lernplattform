import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!(user as any)?.isCreator) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const messages = await prisma.adminMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      seenBy: { select: { userId: true } },
    },
  })

  // Ziel-User-Namen auflösen
  const targetIds = messages.map(m => m.targetUserId).filter(Boolean) as string[]
  const targetUsers = targetIds.length
    ? await prisma.user.findMany({ where: { id: { in: targetIds } }, select: { id: true, name: true } })
    : []
  const targetMap = new Map(targetUsers.map(u => [u.id, u.name]))

  return Response.json({
    messages: messages.map(m => ({
      id: m.id,
      message: m.message,
      senderName: m.senderName,
      showSender: m.showSender,
      targetName: m.targetUserId ? (targetMap.get(m.targetUserId) ?? 'Unbekannt') : null,
      seenCount: m.seenBy.length,
      createdAt: m.createdAt,
      expiresAt: m.expiresAt,
      expired: m.expiresAt < new Date(),
    })),
  })
}
