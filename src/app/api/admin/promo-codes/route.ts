import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function generatePromoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'GRATIS-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      usedBy: { select: { name: true, email: true } },
    },
  })

  return Response.json({ codes })
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  let code = generatePromoCode()
  let attempts = 0
  while (attempts < 10) {
    const conflict = await prisma.promoCode.findUnique({ where: { code } })
    if (!conflict) break
    code = generatePromoCode()
    attempts++
  }

  const promo = await prisma.promoCode.create({ data: { code } })
  return Response.json({ code: promo.code })
}
