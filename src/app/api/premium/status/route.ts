import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ status: 'unauthenticated' })

  const active = isPremiumActive(user)

  const pendingRequest = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: 'pending' },
    select: { code: true, createdAt: true },
  })

  return Response.json({
    isPremium: active,
    premiumUntil: active ? user.premiumUntil : null,
    pendingRequest: pendingRequest ?? null,
  })
}
