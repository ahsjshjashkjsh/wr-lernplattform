import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `HMS-${suffix}`
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  if (isPremiumActive(user)) {
    return Response.json({ error: 'Du hast bereits ein aktives Premium-Abo.' }, { status: 400 })
  }

  const existing = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: 'pending' },
  })
  if (existing) {
    return Response.json({ code: existing.code })
  }

  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const conflict = await prisma.premiumRequest.findUnique({ where: { code } })
    if (!conflict) break
    code = generateCode()
    attempts++
  }

  const request = await prisma.premiumRequest.create({
    data: { userId: user.id, code },
  })

  return Response.json({ code: request.code })
}
