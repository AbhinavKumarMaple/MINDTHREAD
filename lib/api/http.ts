import { NextResponse } from 'next/server';
import { getSession } from '../auth/current-user';
import { clearSessionCookie } from '../auth/cookies';
import { repositories } from '../repositories';
import type { UserRecord } from '../repositories/interfaces';
import { ZodError } from 'zod';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function fail(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function unauthorized(): NextResponse {
  return fail('Unauthorized', 401, { code: 'UNAUTHORIZED' });
}

// Resolve the authenticated user, or return a 401 response.
//
// A valid session JWT can outlive the user it points at (e.g. the row was
// deleted or re-created with a new id during a reseed / db migration). The
// JWT still verifies, so middleware lets the request through and reads quietly
// return nothing — but any write that references userId hits a foreign-key
// violation (P2003) and 500s. To prevent that, confirm the user still exists
// here: if not, clear the stale cookie and report 401 so the client re-logs in.
export async function authUserId(): Promise<
  { userId: string; user: UserRecord } | { response: NextResponse }
> {
  const session = await getSession();
  if (!session) return { response: unauthorized() };
  const user = await repositories.users.findById(session.userId);
  if (!user) {
    clearSessionCookie();
    return { response: unauthorized() };
  }
  return { userId: session.userId, user };
}

function isForeignKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'P2003'
  );
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const first = err.errors[0]?.message;
    return fail(first ?? 'Invalid request', 422, { issues: err.flatten() });
  }
  if (err instanceof Error && err.message === 'API_KEY_REQUIRED') {
    return fail('A Gemini API key is required for AI features.', 400, {
      code: 'API_KEY_REQUIRED',
    });
  }
  if (err instanceof Error && err.message === 'AI_FAILED') {
    return fail('The AI request failed. Please try again.', 502, {
      code: 'AI_FAILED',
    });
  }
  // Defensive net: a foreign-key violation on a userId-scoped write means the
  // session points at a user that no longer exists. Treat as a stale session.
  if (isForeignKeyError(err)) {
    clearSessionCookie();
    return unauthorized();
  }
  console.error(err);
  return fail('Something went wrong', 500);
}
