import { type NextRequest } from 'next/server';
import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { createTaskSchema } from '@/lib/validation/schemas';
import type {
  TaskListFilters,
  TaskStatusFilter,
  TaskSort,
} from '@/lib/repositories/interfaces';

export async function GET(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const sp = req.nextUrl.searchParams;
    const filters: TaskListFilters = {};
    const status = sp.get('status');
    if (status) filters.status = status as TaskStatusFilter;
    const source = sp.get('source');
    if (source === 'entry' || source === 'manual') filters.source = source;
    const from = sp.get('from');
    if (from) filters.from = new Date(from);
    const to = sp.get('to');
    if (to) filters.to = new Date(to);
    const sort = sp.get('sort');
    if (sort) filters.sort = sort as TaskSort;
    const [tasks, counts] = await Promise.all([
      repositories.tasks.list(auth.userId, filters),
      repositories.tasks.counts(auth.userId),
    ]);
    return ok({ tasks, counts });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = createTaskSchema.parse(await req.json());
    const task = await repositories.tasks.create(auth.userId, {
      title: body.title,
      notes: body.notes ?? null,
      priority: body.priority,
      source: body.sourceEntryId ? 'entry' : 'manual',
      sourceEntryId: body.sourceEntryId ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    });
    return ok({ task }, 201);
  } catch (err) {
    return handleError(err);
  }
}
