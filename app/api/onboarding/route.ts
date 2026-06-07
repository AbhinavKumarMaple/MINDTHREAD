import { type NextRequest } from 'next/server';
import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { onboardingSchema } from '@/lib/validation/schemas';
import { toPublicUser } from '@/lib/repositories/serialize';

export async function POST(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = onboardingSchema.parse(await req.json());
    const user = await repositories.users.update(auth.userId, {
      tone: body.tone,
      onboardedAt: new Date(),
    });
    return ok({ user: toPublicUser(user as never) });
  } catch (err) {
    return handleError(err);
  }
}
