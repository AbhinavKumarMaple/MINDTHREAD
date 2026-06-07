import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_MAX_AGE } from './jwt';

// Server-only cookie helpers (used in Route Handlers / Server Components).

export function setSessionCookie(token: string): void {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function getSessionToken(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}
