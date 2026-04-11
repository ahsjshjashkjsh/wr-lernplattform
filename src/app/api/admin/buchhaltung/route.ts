import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!(user as any)?.isCreator) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const entries = await prisma.accountingEntry.findMany({
    orderBy: { datum: 'desc' },
  })

  return Response.json({ entries })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!(user as any)?.isCreator) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { typ, beschreibung, betrag, datum, kategorie, wiederkehrend } = await req.json()

  if (!typ || !beschreibung || !betrag) {
    return Response.json({ error: 'Fehlende Felder.' }, { status: 400 })
  }

  const entry = await prisma.accountingEntry.create({
    data: {
      typ,
      beschreibung,
      betrag: parseFloat(betrag),
      datum: datum ? new Date(datum) : new Date(),
      kategorie: kategorie || null,
      wiederkehrend: wiederkehrend === true,
    },
  })

  return Response.json({ entry })
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!(user as any)?.isCreator) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { id, typ, beschreibung, betrag, datum, kategorie, wiederkehrend } = await req.json()
  if (!id) return Response.json({ error: 'Fehlende ID.' }, { status: 400 })

  const entry = await prisma.accountingEntry.update({
    where: { id },
    data: {
      typ,
      beschreibung,
      betrag: parseFloat(betrag),
      datum: datum ? new Date(datum) : new Date(),
      kategorie: kategorie || null,
      wiederkehrend: wiederkehrend === true,
    },
  })

  return Response.json({ entry })
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser()
  if (!(user as any)?.isCreator) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return Response.json({ error: 'Fehlende ID.' }, { status: 400 })

  await prisma.accountingEntry.delete({ where: { id } })
  return Response.json({ ok: true })
}
