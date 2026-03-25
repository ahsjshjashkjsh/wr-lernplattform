import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
  try {
    const { email } = await request.json() as { email?: string }
    if (!email?.trim()) return Response.json({ error: 'E-Mail erforderlich.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })

    // Always return success to prevent email enumeration
    if (!user) return Response.json({ ok: true })

    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1h

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    const origin = new URL(request.url).origin
    const resetUrl = `${origin}/reset-password?token=${resetToken}`

    if (resend) {
      await resend.emails.send({
        from: 'HMS Lernplattform <onboarding@resend.dev>',
        to: user.email,
        subject: 'Passwort zurücksetzen – HMS Lernplattform',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 8px">Passwort zurücksetzen</h2>
            <p style="color:#6b7280;margin:0 0 20px">Klicke auf den Button um ein neues Passwort zu setzen. Der Link ist 1 Stunde gültig.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Neues Passwort setzen</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:20px">Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.</p>
          </div>
        `,
      }).catch(() => {})
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error)
    return Response.json({ error: 'Fehler beim Senden.' }, { status: 500 })
  }
}
