import { type NextRequest } from 'next/server';
import { authUserId, ok, fail, handleError } from '@/lib/api/http';
import { processedResultSchema } from '@/lib/validation/schemas';
import { saveProcessedEntry } from '@/lib/ai/service';

// The browser runs the Gemini call and POSTs the structured result here to save.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const result = processedResultSchema.parse(await req.json());
    const entry = await saveProcessedEntry(auth.userId, params.id, result);
    return ok({ entry });
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      return fail('Entry not found', 404);
    }
    return handleError(err);
  }
}
