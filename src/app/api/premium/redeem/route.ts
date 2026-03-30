import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  if (isPremiumActive(user)) {
    return Response.json({ error: 'Du hast bereits ein aktives Premium-Abonnement.' }, { status: 400 })
  }

  const body = await request.json() as { code?: string }
  const code = body.code?.trim().toUpperCase()
  if (!code) return Response.json({ error: 'Kein Code angegeben.' }, { status: 400 })

  const promo = await prisma.promoCode.findUnique({ where: { code } })

  if (!promo) return Response.json({ error: 'Ungültiger Code.' }, { status: 404 })
  if (promo.usedById) return Response.json({ error: 'Dieser Code wurde bereits verwendet.' }, { status: 400 })

  const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.$transaction([
    prisma.promoCode.update({
      where: { code },
      data: { usedById: user.id, usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { isPremium: true, premiumUntil },
    }),
  ])

  return Response.json({ ok: true, premiumUntil })
}
