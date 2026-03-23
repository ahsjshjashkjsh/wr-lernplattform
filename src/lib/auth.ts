import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE = 'wr-session'
const SECRET = process.env.JWT_SECRET ?? 'wr-lernplattform-secret-2026-hms'

// ─── Simple HMAC-based JWT ──────────────────────────────────────────────────

function base64url(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (padded.length % 4)) % 4
  return atob(padded + '='.repeat(padLen))
}

async function hmac(key: string, data: string): Promise<string> {
  const k = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))
  return base64url(new Uint8Array(sig))
}

export interface SessionPayload {
  userId: string
  name: string
  email: string
  isAdmin: boolean
}

export async function createToken(payload: SessionPayload): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify({ ...payload, iat: Date.now() }))
  const sig = await hmac(SECRET, `${header}.${body}`)
  return `${header}.${body}.${sig}`
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const expected = await hmac(SECRET, `${header}.${body}`)
    if (expected !== sig) return null
    return JSON.parse(base64urlDecode(body)) as SessionPayload
  } catch {
    return null
  }
}

// ─── Cookie helpers ──────────────────────────────────────────────────────────

export async function setSession(payload: SessionPayload): Promise<void> {
  const token = await createToken(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, isAdmin: true, createdAt: true },
  })
}
