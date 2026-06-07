import { repositories } from '../repositories';
import type { Entry, ProcessedResult } from '../types';

// AI now runs in the browser (browser -> Gemini directly). These server-side
// functions only PERSIST the client-computed results to the cloud DB.

export async function saveProcessedEntry(
  userId: string,
  entryId: string,
  result: ProcessedResult,
): Promise<Entry> {
  const existing = await repositories.entries.get(userId, entryId);
  if (!existing) throw new Error('NOT_FOUND');

  const updated = await repositories.entries.update(userId, entryId, {
    status: 'processed',
    title: result.title,
    summary: result.summary,
    aiAnalysis: result.aiAnalysis,
    reflectiveQuestion: result.reflectiveQuestion,
    moodScore: result.moodScore,
    emotions: result.emotions,
    themes: result.themes,
    isConcern: result.isConcern,
    concernStatus: result.isConcern ? 'unresolved' : null,
    processedAt: new Date(),
    aiError: null,
  });

  if (result.tasks?.length) {
    await repositories.tasks.createMany(
      userId,
      result.tasks.map((t) => ({
        title: t.title,
        priority: t.priority,
        source: 'entry' as const,
        sourceEntryId: entryId,
        isConcern: result.isConcern,
      })),
    );
  }
  return updated as Entry;
}

export async function saveChatExchange(
  userId: string,
  sessionId: string | undefined,
  userMessage: string,
  assistantMessage: string,
) {
  let sid = sessionId;
  if (!sid) {
    const session = await repositories.chat.createSession(userId);
    sid = session.id;
  }
  const session = await repositories.chat.getSession(userId, sid);
  if (!session) throw new Error('NOT_FOUND');

  await repositories.chat.addMessage(userId, sid, 'user', userMessage);
  const assistant = await repositories.chat.addMessage(
    userId,
    sid,
    'assistant',
    assistantMessage,
  );
  return { sessionId: sid, message: assistant };
}

export async function saveInsights(
  userId: string,
  items: { text: string; category?: string; basedOn?: number }[],
) {
  return repositories.insights.replaceAll(userId, items);
}
