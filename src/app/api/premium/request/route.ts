import { prisma } from '@/lib/prisma'
import { getCurrentUser, isPremiumActive } from '@/lib/auth'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `HMS-${suffix}`
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  if (isPremiumActive(user)) {
    return Response.json({ error: 'Du hast bereits ein aktives Premium-Abo.' }, { status: 400 })
  }

  const existing = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: 'pending' },
  })
  if (existing) {
    return Response.json({ code: existing.code })
  }

  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const conflict = await prisma.premiumRequest.findUnique({ where: { code } })
    if (!conflict) break
    code = generateCode()
    attempts++
  }

  const request = await prisma.premiumRequest.create({
    data: { userId: user.id, code },
  })

  // E-Mail-Benachrichtigung
  if (resend) {
    resend.emails.send({
      from: 'HMS Lernplattform <onboarding@resend.dev>',
      to: '3hr907@gmail.com',
      subject: `💰 Neue Premium-Anfrage: ${code}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 16px;font-size:18px;color:#111">Neue Premium-Anfrage</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#666">Code</td><td style="padding:8px 0;font-family:monospace;font-weight:bold;font-size:20px;color:#f59e0b;letter-spacing:2px">${code}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0">${user.name}</td></tr>
            <tr><td style="padding:8px 0;color:#666">E-Mail</td><td style="padding:8px 0">${user.email}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Datum</td><td style="padding:8px 0">${new Date().toLocaleString('de-CH')}</td></tr>
          </table>
          <p style="margin-top:20px;font-size:13px;color:#666">
            Warte auf Twint-Zahlung mit Code <strong>${code}</strong>, dann im Admin-Panel freischalten.
          </p>
        </div>
      `,
    }).catch(() => {}) // Fehler ignorieren — Hauptantwort nicht blockieren
  }

  return Response.json({ code: request.code })
}
