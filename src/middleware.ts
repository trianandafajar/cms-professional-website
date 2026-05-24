// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value

  // All protected routes require authentication
  if (
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/organizations') ||
    pathname.startsWith('/my')
  ) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // /organizations/* is only for organizers
  // /my/* is only for attendees (non-organizers)
  if (pathname.startsWith('/organizations') || pathname.startsWith('/my')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    try {
      // Call Payload's /api/users/me to check isOrganizer
      const meUrl = new URL('/api/users/me', request.url)
      const meRes = await fetch(meUrl.toString(), {
        headers: { Cookie: `payload-token=${token}` },
      })

      if (meRes.ok) {
        const data = await meRes.json()
        const user = data?.user
        if (user) {
          if (pathname.startsWith('/organizations') && !user.isOrganizer) {
            // Not an organizer — redirect to attendee dashboard
            return NextResponse.redirect(new URL('/my/tickets', request.url))
          }
          if (pathname.startsWith('/my') && user.isOrganizer) {
            // Organizer trying to access attendee routes — redirect to organizer dashboard
            return NextResponse.redirect(new URL('/organizations/dashboard', request.url))
          }
        }
      }
    } catch {
      // If the check fails, allow through (fail-open for now)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/onboarding/:path*', '/organizations/:path*', '/my/:path*'],
}
