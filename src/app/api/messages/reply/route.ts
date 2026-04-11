import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const body = await request.json() as { messageId?: string; content?: string }
  if (!body.messageId || !body.content?.trim()) {
    return Response.json({ error: 'messageId und content sind erforderlich.' }, { status: 400 })
  }

  // Nachricht muss existieren
  const msg = await prisma.adminMessage.findUnique({ where: { id: body.messageId } })
  if (!msg) return Response.json({ error: 'Nachricht nicht gefunden.' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })

  const reply = await prisma.adminMessageReply.create({
    data: {
      messageId: body.messageId,
      userId: session.userId,
      userName: user?.name ?? 'Unbekannt',
      content: body.content.trim(),
    },
  })

  return Response.json({ reply })
}
