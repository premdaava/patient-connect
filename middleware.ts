import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || 'fallback-secret-key-32-chars-minimum');

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get('dag_session')?.value;
  const path = request.nextUrl.pathname;

  const isAppRoute = path.startsWith('/dashboard') || 
    path.startsWith('/patients') || 
    path.startsWith('/appointments') || 
    path.startsWith('/inbox') || 
    path.startsWith('/campaigns') || 
    path.startsWith('/reviews') || 
    path.startsWith('/templates') || 
    path.startsWith('/settings') ||
    path.startsWith('/onboarding');

  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  let isAuthenticated = false;
  if (cookie) {
    try {
      await jwtVerify(cookie, secretKey, { algorithms: ['HS256'] });
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (isAppRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isAuthenticated && !path.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/appointments/:path*',
    '/inbox/:path*',
    '/campaigns/:path*',
    '/reviews/:path*',
    '/templates/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
  ],
};
