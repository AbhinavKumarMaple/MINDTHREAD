import { type NextRequest } from 'next/server';
import { signupSchema } from '@/lib/validation/schemas';
import { repositories } from '@/lib/repositories';
import { hashPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/cookies';
import { toPublicUser } from '@/lib/repositories/serialize';
import { ok, fail, handleError } from '@/lib/api/http';

export async function POST(req: NextRequest) {
  try {
    const body = signupSchema.parse(await req.json());
    const email = body.email.toLowerCase();
    const existing = await repositories.users.findByEmail(email);
    if (existing) {
      return fail('An account with this email already exists.', 409);
    }
    const passwordHash = await hashPassword(body.password);
    const user = await repositories.users.create({
      email,
      passwordHash,
      displayName: body.displayName,
    });
    const token = await createSessionToken({ userId: user.id, email: user.email });
    setSessionCookie(token);
    return ok({ user: toPublicUser(user as never) }, 201);
  } catch (err) {
    return handleError(err);
  }
}
