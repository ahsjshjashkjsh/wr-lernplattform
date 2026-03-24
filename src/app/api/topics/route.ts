import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    const isAdmin = session
      ? (await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } }))?.isAdmin ?? false
      : false

    const topics = await prisma.topic.findMany({
      where: isAdmin ? undefined : { published: true },
      orderBy: { order: 'asc' },
      include: { chapters: { select: { id: true } } },
    })
    return Response.json({ topics })
  } catch (error) {
    console.error('GET /api/topics error:', error)
    return Response.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}
