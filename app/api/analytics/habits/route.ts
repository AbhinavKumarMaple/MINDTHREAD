import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { computeHabits } from '@/lib/analytics';

export async function GET() {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const entries = await repositories.entries.listAll(auth.userId);
    return ok({ habits: computeHabits(entries) });
  } catch (err) {
    return handleError(err);
  }
}
