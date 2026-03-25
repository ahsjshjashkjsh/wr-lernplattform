import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, newPassword, confirmPassword } = await request.json() as {
      token?: string
      newPassword?: string
      confirmPassword?: string
    }

    if (!token) return Response.json({ error: 'Token fehlt.' }, { status: 400 })
    if (!newPassword || newPassword.length < 6) {
      return Response.json({ error: 'Passwort muss mindestens 6 Zeichen haben.' }, { status: 400 })
    }
    if (newPassword !== confirmPassword) {
      return Response.json({ error: 'Passwörter stimmen nicht überein.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } })
    if (!user) return Response.json({ error: 'Ungültiger oder bereits verwendeter Link.' }, { status: 400 })

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return Response.json({ error: 'Dieser Link ist abgelaufen. Bitte fordere einen neuen an.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error)
    return Response.json({ error: 'Fehler beim Zurücksetzen.' }, { status: 500 })
  }
}
