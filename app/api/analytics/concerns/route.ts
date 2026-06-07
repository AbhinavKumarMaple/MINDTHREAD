import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';

export async function GET() {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const all = await repositories.entries.listAll(auth.userId);
    const flagged = all.filter((e) => e.isConcern);
    const counts = {
      total: flagged.length,
      unresolved: flagged.filter((e) => e.concernStatus === 'unresolved').length,
      improving: flagged.filter((e) => e.concernStatus === 'improving').length,
      resolved: flagged.filter((e) => e.concernStatus === 'resolved').length,
    };
    const flaggedPct =
      all.length > 0 ? Math.round((flagged.length / all.length) * 100) : 0;
    const entries = flagged
      .slice()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return ok({ entries, counts, flaggedPct, totalEntries: all.length });
  } catch (err) {
    return handleError(err);
  }
}
