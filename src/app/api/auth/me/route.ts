import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ user: null }, { status: 401 })
  }
  // Update lastOnline silently
  prisma.user.update({ where: { id: user.id }, data: { lastOnline: new Date() } }).catch(() => {})
  return Response.json({ user })
}
