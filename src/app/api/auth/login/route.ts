import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string }
    const identifier = body.email?.trim() ?? ''
    const password = body.password ?? ''

    if (!identifier || !password) {
      return Response.json({ error: 'E-Mail / Nutzername und Passwort sind erforderlich.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    // Check if IP is banned
    const bannedIp = await prisma.bannedIp.findUnique({ where: { ip } })
    if (bannedIp) {
      return Response.json({ error: 'BANNED' }, { status: 403 })
    }

    // Supports login by email OR username
    const isEmail = identifier.includes('@')
    const user = isEmail
      ? await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } })
      : await prisma.user.findFirst({ where: { name: { equals: identifier, mode: 'insensitive' } } })

    if (!user) {
      return Response.json({ error: 'Ungültiger Nutzername / E-Mail oder Passwort.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return Response.json({ error: 'Ungültiger Nutzername / E-Mail oder Passwort.' }, { status: 401 })
    }

    if (user.isBanned) {
      return Response.json({ error: 'BANNED' }, { status: 403 })
    }

    if (!user.isApproved) {
      return Response.json({ error: 'PENDING' }, { status: 403 })
    }

    // Update last login info
    await prisma.user.update({
      where: { id: user.id },
      data: { lastOnline: new Date(), lastIp: ip },
    })

    await setSession({ userId: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } })
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return Response.json({ error: 'Anmeldung fehlgeschlagen. Bitte nochmals versuchen.' }, { status: 500 })
  }
}
