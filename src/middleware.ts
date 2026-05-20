import { NextRequest, NextResponse } from 'next/server'

type MeResponse = {
  user?: {
    role?:
      | number
      | {
          name?: string
        }
      | null
  } | null
}

const isSuperAdmin = (role: number | { name?: string } | null | undefined) => {
  if (!role) return false
  if (typeof role === 'object' && 'name' in role) {
    return role.name === 'super-admin'
  }
  return false
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/admin/create-first-user') {
    return NextResponse.next()
  }

  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    // Allow bootstrap for very first user when no session exists yet.
    return NextResponse.next()
  }

  try {
    const meURL = new URL('/api/users/me', request.url)
    const meResponse = await fetch(meURL, {
      headers: {
        cookie: cookieHeader,
      },
    })

    if (!meResponse.ok) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const meData = (await meResponse.json()) as MeResponse
    if (isSuperAdmin(meData.user?.role)) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/admin', request.url))
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/admin/create-first-user'],
}
