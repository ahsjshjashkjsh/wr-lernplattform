import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function fetchData() {
  const [users, bannedIps] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isBanned: true,
        createdAt: true,
        lastOnline: true,
        lastIp: true,
        _count: { select: { quizAttempts: true, progress: true } },
        quizAttempts: { select: { completedAt: true, scorePercent: true }, orderBy: { completedAt: 'desc' }, take: 1 },
        progress: { select: { bestScore: true, status: true }, where: { status: 'completed' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bannedIp.findMany({ select: { ip: true } }),
  ])
  return { users, bannedIps: bannedIps.map(b => b.ip) }
}

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.isAdmin) return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          const data = await fetchData()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // DB error — skip this tick
        }
      }

      await send()
      const interval = setInterval(send, 3_000)

      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
