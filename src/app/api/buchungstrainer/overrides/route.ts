import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function requireTrainer() {
  const user = await getCurrentUser()
  if (!user || user.isBanned) return null
  if (user.isAdmin || user.buchungstrainerRole) return user
  return null
}

// GET — öffentlich (für den Buchungstrainer)
export async function GET() {
  const overrides = await prisma.buchungstrainerCardOverride.findMany()
  return Response.json({ overrides })
}

// POST — Override erstellen oder aktualisieren
export async function POST(request: Request) {
  const user = await requireTrainer()
  if (!user) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const body = await request.json() as { staticId?: number; question?: string; answer?: string }
  if (!body.staticId) return Response.json({ error: 'staticId fehlt.' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (body.question !== undefined) data.question = body.question.trim() || null
  if (body.answer !== undefined) data.answer = body.answer.trim() || null

  const override = await prisma.buchungstrainerCardOverride.upsert({
    where: { staticId: body.staticId },
    create: { staticId: body.staticId, ...data },
    update: data,
  })
  return Response.json({ override })
}

// DELETE — Override löschen (stellt Original wieder her)
export async function DELETE(request: Request) {
  const user = await requireTrainer()
  if (!user) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const staticId = searchParams.get('staticId')
  if (!staticId) return Response.json({ error: 'staticId fehlt.' }, { status: 400 })

  await prisma.buchungstrainerCardOverride.deleteMany({ where: { staticId: parseInt(staticId) } })
  return Response.json({ success: true })
}
