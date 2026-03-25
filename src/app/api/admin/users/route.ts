import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return null
  return user
}

// GET — alle User laden
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

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

  return Response.json({ users, bannedIps: bannedIps.map(b => b.ip) })
}

// POST — neuen User erstellen
export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const body = await request.json() as { name?: string; email?: string; password?: string; isAdmin?: boolean }
  const name = body.name?.trim() ?? ''
  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''

  if (!name || !email || !password) {
    return Response.json({ error: 'Name, E-Mail und Passwort sind erforderlich.' }, { status: 400 })
  }
  if (password.length < 6) {
    return Response.json({ error: 'Passwort muss mindestens 6 Zeichen haben.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'Diese E-Mail ist bereits registriert.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, isAdmin: body.isAdmin ?? false },
    select: { id: true, name: true, email: true, isAdmin: true, isBanned: true, createdAt: true },
  })

  return Response.json({ user })
}

// PATCH — User bearbeiten (isAdmin, isBanned, name, email, password, banIp)
export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const body = await request.json() as {
    userId: string
    isAdmin?: boolean
    isBanned?: boolean
    banIp?: boolean   // wenn true: IP des Users auch sperren
    name?: string
    email?: string
    password?: string
  }
  if (!body.userId) return Response.json({ error: 'userId fehlt.' }, { status: 400 })

  if (body.userId === admin.id && body.isAdmin === false) {
    return Response.json({ error: 'Du kannst deinen eigenen Admin-Status nicht entfernen.' }, { status: 400 })
  }
  if (body.userId === admin.id && body.isBanned === true) {
    return Response.json({ error: 'Du kannst dich nicht selbst sperren.' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (body.isAdmin !== undefined) data.isAdmin = body.isAdmin
  if (body.isBanned !== undefined) data.isBanned = body.isBanned
  if (body.name?.trim()) data.name = body.name.trim()
  if (body.email?.trim()) data.email = body.email.trim().toLowerCase()
  if (body.password && body.password.length >= 6) {
    data.passwordHash = await bcrypt.hash(body.password, 12)
  }

  const updated = await prisma.user.update({
    where: { id: body.userId },
    data,
    select: { id: true, name: true, email: true, isAdmin: true, isBanned: true, lastIp: true },
  })

  // IP sperren falls gewünscht und User eine IP hat
  if (body.isBanned === true && body.banIp && updated.lastIp && updated.lastIp !== 'unknown') {
    await prisma.bannedIp.upsert({
      where: { ip: updated.lastIp },
      create: { ip: updated.lastIp, reason: `Gesperrt zusammen mit Account: ${updated.name}` },
      update: {},
    })
  }

  // IP freigeben falls User entsperrt wird
  if (body.isBanned === false && updated.lastIp) {
    await prisma.bannedIp.deleteMany({ where: { ip: updated.lastIp } }).catch(() => {})
  }

  return Response.json({ user: updated })
}

// DELETE — User löschen
export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return Response.json({ error: 'userId fehlt.' }, { status: 400 })

  if (userId === admin.id) {
    return Response.json({ error: 'Du kannst deinen eigenen Account nicht löschen.' }, { status: 400 })
  }

  await prisma.quizAttemptAnswer.deleteMany({ where: { attempt: { userId } } })
  await prisma.quizAttempt.deleteMany({ where: { userId } })
  await prisma.chapterProgress.deleteMany({ where: { userId } })
  await prisma.user.delete({ where: { id: userId } })

  return Response.json({ success: true })
}
