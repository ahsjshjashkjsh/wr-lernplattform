import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const CATEGORY_LABELS: Record<string, string> = { bug: 'Fehler', feature: 'Vorschlag', content: 'Inhalt', general: 'Allgemein' }

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
    return Response.json({ feedback })
  } catch (error) {
    console.error('GET /api/feedback error:', error)
    return Response.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, message, category } = await request.json() as {
      title: string
      message: string
      category: string
    }

    if (!title?.trim() || !message?.trim()) {
      return Response.json({ error: 'Titel und Nachricht sind erforderlich.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })

    // Rate-Limit: max 5 Feedbacks pro User pro Tag
    if (!user?.isAdmin) {
      const since = new Date()
      since.setHours(0, 0, 0, 0)
      const todayCount = await prisma.feedback.count({
        where: { userId: session.userId, createdAt: { gte: since } },
      })
      if (todayCount >= 5) {
        return Response.json({ error: 'Du hast heute bereits 5 Feedbacks gesendet. Bitte versuche es morgen wieder.' }, { status: 429 })
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.userId,
        userName: user?.name ?? 'Unbekannt',
        title: title.trim(),
        message: message.trim(),
        category: category ?? 'general',
        status: 'pending',
      },
    })

    // Email-Benachrichtigung senden
    if (resend) {
      const catLabel = CATEGORY_LABELS[feedback.category] ?? feedback.category
      await resend.emails.send({
        from: 'HMS Lernplattform <onboarding@resend.dev>',
        to: '3hr907@gmail.com',
        subject: `[${catLabel}] Neues Feedback: ${feedback.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 4px">Neues Feedback eingegangen</h2>
            <p style="color:#6b7280;margin:0 0 24px;font-size:14px">${new Date().toLocaleString('de-CH')}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
              <tr><td style="padding:8px 12px;background:#f3f4f6;border-radius:6px 6px 0 0;font-weight:600;width:120px">Von</td><td style="padding:8px 12px;background:#f9fafb">${feedback.userName}</td></tr>
              <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Kategorie</td><td style="padding:8px 12px;background:#f9fafb">${catLabel}</td></tr>
              <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Titel</td><td style="padding:8px 12px;background:#f9fafb">${feedback.title}</td></tr>
              <tr><td style="padding:8px 12px;background:#f3f4f6;border-radius:0 0 6px 6px;font-weight:600;vertical-align:top">Nachricht</td><td style="padding:8px 12px;background:#f9fafb;white-space:pre-wrap">${feedback.message}</td></tr>
            </table>
            <p style="font-size:12px;color:#9ca3af">HMS Lernplattform · Automatische Benachrichtigung</p>
          </div>
        `,
      }).catch(() => {}) // Fehler beim Senden soll Feedback-Erstellung nicht blockieren
    }

    return Response.json({ feedback })
  } catch (error) {
    console.error('POST /api/feedback error:', error)
    return Response.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'id fehlt.' }, { status: 400 })

    await prisma.feedback.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/feedback error:', error)
    return Response.json({ error: 'Failed to delete feedback' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

    const { id, status, adminNote } = await request.json() as {
      id: string
      status: 'accepted' | 'rejected' | 'implemented'
      adminNote?: string
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status, adminNote: adminNote ?? null },
    })
    return Response.json({ feedback })
  } catch (error) {
    console.error('PATCH /api/feedback error:', error)
    return Response.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}
