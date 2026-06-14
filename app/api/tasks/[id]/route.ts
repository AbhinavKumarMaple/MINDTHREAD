import { type NextRequest } from 'next/server';
import { authUserId, ok, fail, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { updateTaskSchema } from '@/lib/validation/schemas';
import type { UpdateTaskInput } from '@/lib/repositories/interfaces';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = updateTaskSchema.parse(await req.json());
    const update: UpdateTaskInput = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.notes !== undefined) update.notes = body.notes ?? null;
    if (body.status !== undefined) update.status = body.status;
    if (body.priority !== undefined) update.priority = body.priority;
    // dueDate: ISO string -> Date, or null to clear.
    if (body.dueDate !== undefined)
      update.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    const task = await repositories.tasks.update(auth.userId, params.id, update);
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
