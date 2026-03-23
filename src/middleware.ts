import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/api/auth/login', '/api/auth/register']

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (payload.length % 4)) % 4
    return JSON.parse(atob(payload + '='.repeat(padLen)))
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
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

  const payload = decodeJwtPayload(session.value)

  // Gebannte User sofort abmelden
  if (payload?.isBanned && !pathname.startsWith('/login')) {
    const res = NextResponse.redirect(new URL('/login', request.url))
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
