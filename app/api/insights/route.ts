import { type NextRequest } from 'next/server';
import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { insightsSaveSchema } from '@/lib/validation/schemas';
import { saveInsights } from '@/lib/ai/service';

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

// The browser computes insights (Gemini) and POSTs them here to save.
export async function POST(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = insightsSaveSchema.parse(await req.json());
    const insights = await saveInsights(auth.userId, body.insights);
    return ok({ insights });
  } catch (err) {
    return handleError(err);
  }
}
