import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve session cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;

  // Define public paths that do not require authentication
  const isPublicPath = pathname === '/login' || pathname === '/register';
  
  // Define assets or API routes that should be bypassed
  const isBypassed = pathname.startsWith('/_next') || 
                     pathname.startsWith('/favicon.ico') || 
                     pathname.startsWith('/public') ||
                     pathname.startsWith('/api/auth') ||
                     pathname === '/api/health';

  if (isBypassed) {
    return NextResponse.next();
  }

  // 1. Unauthenticated users accessing protected routes -> redirect to login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated users visiting login or root -> redirect to role home
  if (session && (isPublicPath || pathname === '/')) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  // 3. Role protection: USER attempting to access Admin routes
  if (session && session.role === 'USER') {
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/customer')) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  // 4. Admin visiting root /dashboard -> redirect to /admin
  if (session && session.role === 'ADMIN' && (pathname === '/dashboard' || pathname === '/')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
