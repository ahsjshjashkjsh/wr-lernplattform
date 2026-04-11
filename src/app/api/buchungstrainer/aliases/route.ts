import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function requireTrainer() {
  const user = await getCurrentUser()
  if (!user || user.isBanned) return null
  if (user.isAdmin || (user as any).buchungstrainerRole) return user
  return null
}

// GET — alle Aliases laden (öffentlich — für den Buchungstrainer)
export async function GET() {
  const aliases = await prisma.buchungstrainerAlias.findMany({
    orderBy: { cardId: 'asc' },
  })
  return Response.json({ aliases })
}

// POST — neuen Alias hinzufügen
export async function POST(request: Request) {
  const user = await requireTrainer()
  if (!user) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const body = await request.json() as { cardId?: number; isCustom?: boolean; answer?: string }
  if (body.cardId == null || !body.answer?.trim()) {
    return Response.json({ error: 'cardId und answer sind erforderlich.' }, { status: 400 })
  }

  const alias = await prisma.buchungstrainerAlias.create({
    data: {
      cardId: body.cardId,
      isCustom: body.isCustom ?? false,
      answer: body.answer.trim(),
    },
  })
  return Response.json({ alias })
}

// DELETE — Alias löschen
export async function DELETE(request: Request) {
  const user = await requireTrainer()
  if (!user) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id fehlt.' }, { status: 400 })

  await prisma.buchungstrainerAlias.delete({ where: { id: parseInt(id) } })
  return Response.json({ success: true })
}
