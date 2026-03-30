import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login', '/register', '/banned',
  '/verify-email', '/forgot-password', '/reset-password',
  '/api/auth/login', '/api/auth/register',
  '/api/auth/verify-email', '/api/auth/forgot-password', '/api/auth/reset-password',
]

const SECRET = process.env.JWT_SECRET ?? 'wr-lernplattform-secret-2026-hms'

async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const sigBytes = Uint8Array.from(
      atob(sig.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0),
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(`${header}.${body}`),
    )

    if (!valid) return null

    const padded = body.replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (padded.length % 4)) % 4
    return JSON.parse(atob(padded + '='.repeat(padLen)))
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const session = request.cookies.get('wr-session')
  if (!session?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify JWT signature — reject tampered or fake tokens
  const payload = await verifyToken(session.value)
  if (!payload) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('wr-session')
    return res
  }

  // Gebannte User sofort abmelden und zu /banned schicken
  if (payload?.isBanned && !pathname.startsWith('/banned') && !pathname.startsWith('/login')) {
    const res = NextResponse.redirect(new URL('/banned', request.url))
    res.cookies.delete('wr-session')
    return res
  }

  // Protect /admin — only for admins
  if (pathname.startsWith('/admin')) {
    if (!payload?.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
