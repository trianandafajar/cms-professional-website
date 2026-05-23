// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value

  // Protect /onboarding and /organizations routes
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/organizations')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/onboarding/:path*', '/organizations/:path*'] }
