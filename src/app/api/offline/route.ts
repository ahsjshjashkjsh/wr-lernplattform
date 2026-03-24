import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ ok: false })

  // lastOnline auf weit in der Vergangenheit setzen → sofort als offline erkannt
  await prisma.user.update({
    where: { id: session.userId },
    data: { lastOnline: new Date(0) },
  })

  return Response.json({ ok: true })
}
