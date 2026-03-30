import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { id } = await params

  const request = await prisma.premiumRequest.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  })
  if (!request) return Response.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })
  if (request.status !== 'pending') {
    return Response.json({ error: 'Anfrage ist nicht mehr offen.' }, { status: 400 })
  }

  const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const betrag = parseFloat(process.env.NEXT_PUBLIC_PREMIUM_PRICE ?? '5')

  await prisma.$transaction([
    prisma.premiumRequest.update({
      where: { id },
      data: { status: 'approved' },
    }),
    prisma.user.update({
      where: { id: request.userId },
      data: { isPremium: true, premiumUntil },
    }),
    prisma.accountingEntry.create({
      data: {
        typ: 'ertrag',
        beschreibung: `Premium — ${request.user.name}`,
        betrag,
        kategorie: 'Premium',
        datum: new Date(),
      },
    }),
  ])

  return Response.json({ ok: true, premiumUntil })
}
