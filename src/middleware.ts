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

  // /organizations/* requires organizer role
  if (pathname.startsWith('/organizations') && token) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const meUrl = new URL('/api/users/me', request.url)
      const meRes = await fetch(meUrl.toString(), {
        headers: { Cookie: `payload-token=${token}` },
        signal: controller.signal,
        cache: 'no-store',
      })

      clearTimeout(timeoutId)

      if (meRes.ok) {
        const data = await meRes.json()
        const user = data?.user
        if (user && !user.isOrganizer) {
          // Not an organizer — redirect away
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    } catch {
      // Timeout or network error — allow through (fail-open)
    }
  }

  // /my/* requires attendee role (not organizer)
  if (pathname.startsWith('/my') && token) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const meUrl = new URL('/api/users/me', request.url)
      const meRes = await fetch(meUrl.toString(), {
        headers: { Cookie: `payload-token=${token}` },
        signal: controller.signal,
        cache: 'no-store',
      })

      clearTimeout(timeoutId)

      if (meRes.ok) {
        const data = await meRes.json()
        const user = data?.user
        if (user && user.isOrganizer) {
          // Organizer trying to access attendee routes — redirect to dashboard
          return NextResponse.redirect(new URL('/organizations/dashboard', request.url))
        }
      }
    } catch {
      // Timeout or network error — allow through (fail-open)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/onboarding/:path*', '/organizations/:path*', '/my/:path*'],
}
