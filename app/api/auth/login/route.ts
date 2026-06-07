import { type NextRequest } from 'next/server';
import { loginSchema } from '@/lib/validation/schemas';
import { repositories } from '@/lib/repositories';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/cookies';
import { toPublicUser } from '@/lib/repositories/serialize';
import { ok, fail, handleError } from '@/lib/api/http';

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());
    const email = body.email.toLowerCase();
    const user = await repositories.users.findByEmail(email);
    if (!user) return fail('Invalid email or password.', 401);
    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) return fail('Invalid email or password.', 401);
    const token = await createSessionToken({ userId: user.id, email: user.email });
    setSessionCookie(token);
    return ok({ user: toPublicUser(user as never) });
  } catch (err) {
    return handleError(err);
  }
}
