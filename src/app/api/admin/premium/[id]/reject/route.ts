import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { id } = await params

  const request = await prisma.premiumRequest.findUnique({ where: { id } })
  if (!request) return Response.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })

  await prisma.premiumRequest.update({
    where: { id },
    data: { status: 'rejected' },
  })

  return Response.json({ ok: true })
}
