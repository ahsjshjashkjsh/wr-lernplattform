import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
    const emailVerifyToken = randomBytes(32).toString('hex')
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    const user = await prisma.user.create({
      data: { name, email, passwordHash, lastIp: ip, emailVerified: false, emailVerifyToken, emailVerifyExpiry },
    })

    // Send verification email
    const origin = new URL(request.url).origin
    const verifyUrl = `${origin}/verify-email?token=${emailVerifyToken}`
    if (resend) {
      await resend.emails.send({
        from: 'HMS Lernplattform <onboarding@resend.dev>',
        to: email,
        subject: 'E-Mail-Adresse bestätigen – HMS Lernplattform',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 8px">Hallo ${name}!</h2>
            <p style="color:#6b7280;margin:0 0 20px">Bitte bestätige deine E-Mail-Adresse um die Registrierung abzuschliessen.</p>
            <a href="${verifyUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">E-Mail bestätigen</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:20px">Dieser Link ist 24 Stunden gültig. Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
          </div>
        `,
      }).catch(() => {})
    }

    return Response.json({ needsVerification: true })
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return Response.json({ error: 'Registrierung fehlgeschlagen. Bitte nochmals versuchen.' }, { status: 500 })
  }
}
