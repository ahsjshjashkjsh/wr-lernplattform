import { prisma } from '@/lib/prisma'
import { getCurrentUser, setSession, createToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const IMPERSONATE_COOKIE = 'wr-admin-session'

// POST /api/admin/impersonate — Admin übernimmt einen User-Account
export async function POST(req: Request) {
  const admin = await getCurrentUser()
  if (!admin?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId } = await req.json() as { userId: string }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, isAdmin: true },
  })
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 })

  // Aktuelle Admin-Session als Backup speichern
  const cookieStore = await cookies()
  const currentToken = cookieStore.get('wr-session')?.value ?? ''
  cookieStore.set(IMPERSONATE_COOKIE, currentToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4, // 4 Stunden
  })

  // Als Ziel-User einloggen
  await setSession({
    userId: target.id,
    name: target.name,
    email: target.email,
    isAdmin: target.isAdmin,
  })

  return Response.json({ ok: true, name: target.name })
}

// DELETE /api/admin/impersonate — Zurück zum Admin-Account
export async function DELETE() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get(IMPERSONATE_COOKIE)?.value
  if (!adminToken) return Response.json({ error: 'No admin session saved' }, { status: 400 })

  // Admin-Token wiederherstellen
  cookieStore.set('wr-session', adminToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  // Backup-Cookie löschen
  cookieStore.delete(IMPERSONATE_COOKIE)

  return Response.json({ ok: true })
}

// GET /api/admin/impersonate — prüft ob gerade eine Impersonation aktiv ist
export async function GET() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get(IMPERSONATE_COOKIE)?.value
  if (!adminToken) return Response.json({ active: false })
  return Response.json({ active: true })
}
