import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: {
        chapters: { select: { id: true } },
      },
    })
    return Response.json({ topics })
  } catch (error) {
    console.error('GET /api/topics error:', error)
    return Response.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}
