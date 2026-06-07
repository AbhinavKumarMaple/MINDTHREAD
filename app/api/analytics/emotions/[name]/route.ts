import { type NextRequest } from 'next/server';
import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { computeEmotionDetail } from '@/lib/analytics';

export async function GET(
  _req: NextRequest,
  { params }: { params: { name: string } },
) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const entries = await repositories.entries.listAll(auth.userId);
    const detail = computeEmotionDetail(
      entries,
      decodeURIComponent(params.name).toLowerCase(),
    );
    return ok({ detail });
  } catch (err) {
    return handleError(err);
  }
}
