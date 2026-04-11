import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function requireTrainer() {
  const user = await getCurrentUser()
  if (!user || user.isBanned) return null
  if (user.isAdmin || (user as any).buchungstrainerRole) return user
  return null
}

// GET — alle Custom Cards (öffentlich — für den Buchungstrainer)
export async function GET() {
  const cards = await prisma.buchungstrainerCustomCard.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return Response.json({ cards })
}

// POST — neue Custom Card
export async function POST(request: Request) {
  const user = await requireTrainer()
  if (!user) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const body = await request.json() as { question?: string; answer?: string }
  if (!body.question?.trim() || !body.answer?.trim()) {
    return Response.json({ error: 'question und answer sind erforderlich.' }, { status: 400 })
  }

  const card = await prisma.buchungstrainerCustomCard.create({
    data: { question: body.question.trim(), answer: body.answer.trim() },
  })
  return Response.json({ card })
}

// PATCH — Custom Card bearbeiten oder isActive togglen
export async function PATCH(request: Request) {
  const user = await requireTrainer()
  if (!user) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const body = await request.json() as { id?: number; question?: string; answer?: string; isActive?: boolean }
  if (!body.id) return Response.json({ error: 'id fehlt.' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (body.question?.trim()) data.question = body.question.trim()
  if (body.answer?.trim()) data.answer = body.answer.trim()
  if (body.isActive !== undefined) data.isActive = body.isActive

  const card = await prisma.buchungstrainerCustomCard.update({
    where: { id: body.id },
    data,
  })
  return Response.json({ card })
}

// DELETE — Custom Card löschen
export async function DELETE(request: Request) {
  const user = await requireTrainer()
  if (!user) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id fehlt.' }, { status: 400 })

  // Aliases dieser Custom Card auch löschen
  await prisma.buchungstrainerAlias.deleteMany({ where: { cardId: parseInt(id), isCustom: true } })
  await prisma.buchungstrainerCustomCard.delete({ where: { id: parseInt(id) } })
  return Response.json({ success: true })
}
