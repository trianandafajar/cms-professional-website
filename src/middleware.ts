import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split('.')

  if (parts.length < 2) {
    return null
  }

  try {
    const base64Url = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64Url.padEnd(Math.ceil(base64Url.length / 4) * 4, '=')
    const json = atob(padded)
    return JSON.parse(json) as { exp?: number }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value
  const tokenPayload = token ? decodeJwtPayload(token) : null
  const isTokenExpired = !tokenPayload?.exp || tokenPayload.exp * 1000 <= Date.now()

  if (
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/organizations') ||
    pathname.startsWith('/my')
  ) {
    if (!token || isTokenExpired) {
      const response = NextResponse.redirect(new URL('/auth/signin', request.url))
      response.cookies.delete('payload-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/onboarding/:path*', '/organizations/:path*', '/my/:path*'],
}
