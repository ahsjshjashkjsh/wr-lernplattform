import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json() as {
      name: string
      email: string
      message: string
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 })
    }

    await prisma.feedback.create({
      data: {
        userName: name.trim(),
        title: `Anmelde-Problem: ${name.trim()}`,
        message: `E-Mail: ${email.trim()}\n\n${message.trim()}`,
        category: 'general',
        status: 'pending',
      },
    })

    if (resend) {
      await resend.emails.send({
        from: 'HMS Lernplattform <onboarding@resend.dev>',
        to: '3hr907@gmail.com',
        subject: `Anmelde-Problem von ${name.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 4px">Anmelde-Problem gemeldet</h2>
            <p style="color:#6b7280;margin:0 0 24px;font-size:14px">${new Date().toLocaleString('de-CH')}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
              <tr><td style="padding:8px 12px;background:#f3f4f6;border-radius:6px 6px 0 0;font-weight:600;width:100px">Name</td><td style="padding:8px 12px;background:#f9fafb">${name.trim()}</td></tr>
              <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">E-Mail</td><td style="padding:8px 12px;background:#f9fafb">${email.trim()}</td></tr>
              <tr><td style="padding:8px 12px;background:#f3f4f6;border-radius:0 0 6px 6px;font-weight:600;vertical-align:top">Nachricht</td><td style="padding:8px 12px;background:#f9fafb;white-space:pre-wrap">${message.trim()}</td></tr>
            </table>
          </div>
        `,
      }).catch(() => {})
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('POST /api/contact error:', error)
    return Response.json({ error: 'Fehler beim Senden.' }, { status: 500 })
  }
}
