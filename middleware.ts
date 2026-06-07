import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/jwt';

const AUTH_PAGES = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const onAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!session && !onAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : '';
    return NextResponse.redirect(url);
  }

  if (session && onAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/journal';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all pages except API routes (they self-authorize) and static assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\\.svg|.*\\.png).*)',
  ],
};
