import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase() ?? ''
    const password = body.password ?? ''

    if (!email || !password) {
      return Response.json({ error: 'E-Mail und Passwort sind erforderlich.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ error: 'Ungültige E-Mail oder Passwort.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return Response.json({ error: 'Ungültige E-Mail oder Passwort.' }, { status: 401 })
    }

    await setSession({ userId: user.id, name: user.name, email: user.email })
    return Response.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return Response.json({ error: 'Anmeldung fehlgeschlagen. Bitte nochmals versuchen.' }, { status: 500 })
  }
}
