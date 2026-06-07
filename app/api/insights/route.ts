import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { refreshInsightsForUser } from '@/lib/ai/service';

export async function GET() {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const insights = await repositories.insights.list(auth.userId);
    return ok({ insights });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST() {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const insights = await refreshInsightsForUser(auth.userId);
    return ok({ insights });
  } catch (err) {
    return handleError(err);
  }
}
