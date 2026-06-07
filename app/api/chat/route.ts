import { type NextRequest } from 'next/server';
import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { chatSaveSchema } from '@/lib/validation/schemas';
import { saveChatExchange } from '@/lib/ai/service';

export async function GET(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const sessionId = req.nextUrl.searchParams.get('sessionId') ?? undefined;
    const sessions = await repositories.chat.listSessions(auth.userId);
    const targetId = sessionId ?? sessions[0]?.id;
    const current = targetId
      ? await repositories.chat.getSession(auth.userId, targetId)
      : null;
    return ok({ sessions, current });
  } catch (err) {
    return handleError(err);
  }
}

// The browser computes the assistant reply (Gemini) and POSTs both messages to save.
export async function POST(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = chatSaveSchema.parse(await req.json());
    const result = await saveChatExchange(
      auth.userId,
      body.sessionId,
      body.userMessage,
      body.assistantMessage,
    );
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
