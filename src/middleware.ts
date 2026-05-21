// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Skip untuk API, assets, etc
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Cek cookie session Payload
  const token = request.cookies.get('payload-token')?.value;
  if (!token && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Jika ada token, kita perlu cek status onboarding lewat API call (opsional, atau simpan di cookie)
  // Bisa juga dengan membaca user dari server side, tapi untuk sederhananya kita redirect jika path bukan onboarding dan user belum onboarded
  // Namun karena middleware tidak punya akses ke user data dengan mudah, sebaiknya handling di komponen client.
  // Alternatif: buat API endpoint /api/user/me dan panggil di layout.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};