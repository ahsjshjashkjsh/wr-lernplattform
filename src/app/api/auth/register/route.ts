import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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
    await prisma.user.create({
      data: { name, email, passwordHash, lastIp: ip, isApproved: false },
    })

    if (resend) {
      await resend.emails.send({
        from: 'HMS Lernplattform <onboarding@resend.dev>',
        to: '3hr907@gmail.com',
        subject: `Neue Registrierung: ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 4px">Neue Registrierung eingegangen</h2>
            <p style="color:#6b7280;margin:0 0 24px;font-size:14px">${new Date().toLocaleString('de-CH')}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
              <tr><td style="padding:8px 12px;background:#f3f4f6;border-radius:6px 6px 0 0;font-weight:600;width:100px">Name</td><td style="padding:8px 12px;background:#f9fafb">${name}</td></tr>
              <tr><td style="padding:8px 12px;background:#f3f4f6;border-radius:0 0 6px 6px;font-weight:600">E-Mail</td><td style="padding:8px 12px;background:#f9fafb">${email}</td></tr>
            </table>
            <p style="font-size:14px;color:#374151">Gehe ins Admin-Dashboard und genehmige oder lehne die Registrierung ab.</p>
          </div>
        `,
      }).catch(() => {})
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return Response.json({ error: 'Registrierung fehlgeschlagen. Bitte nochmals versuchen.' }, { status: 500 })
  }
}
