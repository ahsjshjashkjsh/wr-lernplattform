import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/auth'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return Response.json({ error: 'Token fehlt.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } })

  if (!user) return Response.json({ error: 'Ungültiger oder bereits verwendeter Link.' }, { status: 400 })

  if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
    return Response.json({ error: 'Dieser Link ist abgelaufen. Bitte registriere dich erneut.' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  })

  await setSession({ userId: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
  return Response.json({ ok: true })
}
