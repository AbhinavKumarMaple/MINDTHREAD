import { type NextRequest } from 'next/server';
import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { settingsSchema } from '@/lib/validation/schemas';
import { encryptSecret } from '@/lib/crypto';
import { toPublicUser } from '@/lib/repositories/serialize';
import type { UpdateUserInput } from '@/lib/repositories/interfaces';

export async function GET() {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const user = await repositories.users.findById(auth.userId);
    if (!user) return ok({ user: null });
    return ok({ user: toPublicUser(user as never) });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = settingsSchema.parse(await req.json());
    const update: UpdateUserInput = {};
    if (body.tone) update.tone = body.tone;
    if (body.displayName) update.displayName = body.displayName;
    if (body.geminiApiKey !== undefined) {
      const trimmed = body.geminiApiKey.trim();
      update.geminiApiKeyEnc = trimmed ? encryptSecret(trimmed) : null;
    }
    const user = await repositories.users.update(auth.userId, update);
    return ok({ user: toPublicUser(user as never) });
  } catch (err) {
    return handleError(err);
  }
}
