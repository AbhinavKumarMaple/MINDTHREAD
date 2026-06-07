import { clearSessionCookie } from '@/lib/auth/cookies';
import { ok } from '@/lib/api/http';

export async function POST() {
  clearSessionCookie();
  return ok({ ok: true });
}
