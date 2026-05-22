// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/onboarding')) {
    // Cek cookie session Payload (atau token)
    const token = request.cookies.get('payload-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    // Di sini Anda bisa cek isOnboarded dari API, tapi untuk sederhananya skip dulu
  }
  return NextResponse.next();
}

export const config = { matcher: ['/onboarding/:path*'] };
