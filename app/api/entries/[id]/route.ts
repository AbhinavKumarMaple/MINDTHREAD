import { type NextRequest } from 'next/server';
import { authUserId, ok, fail, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { updateEntrySchema } from '@/lib/validation/schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const entry = await repositories.entries.get(auth.userId, params.id);
    if (!entry) return fail('Entry not found', 404);
    return ok({ entry });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = updateEntrySchema.parse(await req.json());
    const wordCount =
      body.rawDump !== undefined
        ? body.rawDump.trim()
          ? body.rawDump.trim().split(/\s+/).length
          : 0
        : undefined;
    const entry = await repositories.entries.update(auth.userId, params.id, {
      ...body,
      ...(wordCount !== undefined ? { wordCount } : {}),
    });
    if (!entry) return fail('Entry not found', 404);
    return ok({ entry });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    await repositories.entries.remove(auth.userId, params.id);
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
