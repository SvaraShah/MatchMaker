import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve session cookie
  const session = request.cookies.get('matchmaker_session');

  // Define public paths that do not require authentication
  const isPublicPath = pathname === '/login';
  
  // Define assets or API routes that should be bypassed
  const isAsset = pathname.startsWith('/_next') || 
                  pathname.startsWith('/favicon.ico') || 
                  pathname.startsWith('/public') ||
                  pathname.startsWith('/api/auth'); // Auth API is public

  if (isAsset) {
    return NextResponse.next();
  }

  // If visiting login page and session exists, redirect to dashboard
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If visiting protected page and session DOES NOT exist, redirect to login
  if (!isPublicPath && !session && pathname !== '/api/auth/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If root "/", redirect to dashboard (which will then verify session)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, static assets, etc.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
