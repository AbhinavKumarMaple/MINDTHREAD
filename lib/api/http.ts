import { NextResponse } from 'next/server';
import { getSession } from '../auth/current-user';
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
  return fail('Unauthorized', 401);
}

// Resolve the authenticated user id, or return a 401 response.
export async function authUserId(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const session = await getSession();
  if (!session) return { response: unauthorized() };
  return { userId: session.userId };
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
  console.error(err);
  return fail('Something went wrong', 500);
}
