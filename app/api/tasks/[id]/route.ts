import { type NextRequest } from 'next/server';
import { authUserId, ok, fail, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { updateTaskSchema } from '@/lib/validation/schemas';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = updateTaskSchema.parse(await req.json());
    const task = await repositories.tasks.update(auth.userId, params.id, body);
    if (!task) return fail('Task not found', 404);
    return ok({ task });
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
    await repositories.tasks.remove(auth.userId, params.id);
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
