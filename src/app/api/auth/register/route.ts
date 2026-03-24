import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    }

    const name = body.name?.trim() ?? ''
    const email = body.email?.trim().toLowerCase() ?? ''
    const password = body.password ?? ''
    const confirmPassword = body.confirmPassword ?? ''

    if (!name || !email || !password || !confirmPassword) {
      return Response.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 })
    }
    if (name.length < 2) {
      return Response.json({ error: 'Name muss mindestens 2 Zeichen haben.' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: 'Bitte eine gültige E-Mail-Adresse eingeben.' }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ error: 'Passwort muss mindestens 6 Zeichen haben.' }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return Response.json({ error: 'Passwörter stimmen nicht überein.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    // Check if IP is banned
    const bannedIp = await prisma.bannedIp.findUnique({ where: { ip } })
    if (bannedIp) {
      return Response.json({ error: 'Registrierung nicht möglich.' }, { status: 403 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, lastIp: ip },
    })

    await setSession({ userId: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } })
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return Response.json({ error: 'Registrierung fehlgeschlagen. Bitte nochmals versuchen.' }, { status: 500 })
  }
}
