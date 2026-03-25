import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest } from 'next/server'

// POST — Aktivität loggen (authentifizierter User)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const { action, detail, page } = await request.json()
  if (!action || !page) return Response.json({ error: 'Fehlende Felder.' }, { status: 400 })

  // Max 300 Einträge gesamt behalten – älteste löschen wenn zu viele
  const total = await prisma.activityLog.count()
  if (total >= 300) {
    const oldest = await prisma.activityLog.findFirst({ orderBy: { createdAt: 'asc' } })
    if (oldest) await prisma.activityLog.delete({ where: { id: oldest.id } })
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      action,
      detail: detail ?? null,
      page,
    },
  })

  return Response.json({ ok: true })
}

// GET — Letzte Aktivitäten (nur Admin)
export async function GET() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 60,
  })

  return Response.json({ logs })
}
