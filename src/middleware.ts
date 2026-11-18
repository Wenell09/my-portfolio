import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions);

    if (!session.isLoggedIn) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // If already logged in, redirect /admin/login to /admin/dashboard
  if (pathname === '/admin/login') {
    const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions);
    if (session.isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
