import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// GET — alle Sessions des eingeloggten Users
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ sessions: [] }, { status: 401 })

  const rows = await prisma.buchungstrainerSession.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
    take: 50,
  })

  const sessions = rows.map(r => ({
    id:           r.id,
    startedAt:    r.startedAt.getTime(),
    completedAt:  r.completedAt?.getTime(),
    totalCards:   r.totalCards,
    cardsDone:    r.cardsDone,
    score:        { ok: r.scoreOk, fail: r.scoreFail },
    wrongIndices: r.wrongIndices as number[],
    order:        r.cardOrder as number[],
    filter:       r.filter,
    shuffled:     r.shuffled,
    isComplete:   r.isComplete,
  }))

  return Response.json({ sessions })
}

// PUT — Session anlegen oder aktualisieren (upsert by id)
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, startedAt, completedAt, totalCards, cardsDone, score, wrongIndices, order, filter, shuffled, isComplete } = body

  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  await prisma.buchungstrainerSession.upsert({
    where: { id },
    create: {
      id,
      userId:       user.id,
      startedAt:    new Date(startedAt),
      completedAt:  completedAt ? new Date(completedAt) : null,
      totalCards:   totalCards ?? 0,
      cardsDone:    cardsDone ?? 0,
      scoreOk:      score?.ok ?? 0,
      scoreFail:    score?.fail ?? 0,
      wrongIndices: wrongIndices ?? [],
      cardOrder:    order ?? [],
      filter:       filter ?? 'all',
      shuffled:     shuffled ?? false,
      isComplete:   isComplete ?? false,
    },
    update: {
      completedAt:  completedAt ? new Date(completedAt) : null,
      totalCards:   totalCards ?? 0,
      cardsDone:    cardsDone ?? 0,
      scoreOk:      score?.ok ?? 0,
      scoreFail:    score?.fail ?? 0,
      wrongIndices: wrongIndices ?? [],
      cardOrder:    order ?? [],
      filter:       filter ?? 'all',
      shuffled:     shuffled ?? false,
      isComplete:   isComplete ?? false,
      updatedAt:    new Date(),
    },
  })

  return Response.json({ ok: true })
}

// DELETE — eine Session oder alle löschen
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id  = searchParams.get('id')
  const all = searchParams.get('all')

  if (all === '1') {
    await prisma.buchungstrainerSession.deleteMany({ where: { userId: user.id } })
  } else if (id) {
    await prisma.buchungstrainerSession.deleteMany({ where: { id, userId: user.id } })
  } else {
    return Response.json({ error: 'id or all required' }, { status: 400 })
  }

  return Response.json({ ok: true })
}
