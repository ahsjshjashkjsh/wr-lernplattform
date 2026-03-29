import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const requests = await prisma.premiumRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, isPremium: true, premiumUntil: true } },
    },
  })

  return Response.json({ requests })
}
