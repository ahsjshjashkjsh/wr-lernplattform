import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  const session = request.cookies.get('wr-session')
  const payload = session?.value ? decodeJwtPayload(session.value) : null

  // Gebannte User zu /banned schicken
  if (payload?.isBanned && !pathname.startsWith('/banned') && !pathname.startsWith('/login')) {
    const res = NextResponse.redirect(new URL('/banned', request.url))
    res.cookies.delete('wr-session')
    return res
  }

  // Protect /admin — nur für Admins, Login erforderlich
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
