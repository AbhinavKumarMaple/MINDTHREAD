import type {
  Entry as PEntry,
  Task as PTask,
  ChatSession as PChatSession,
  ChatMessage as PChatMessage,
  Insight as PInsight,
  User as PUser,
} from '@prisma/client';
import type {
  Entry,
  Task,
  ChatSession,
  ChatMessage,
  Insight,
  PublicUser,
  Tone,
  EntryStatus,
  TaskStatus,
  Priority,
  TaskSource,
  ConcernStatus,
} from '../types';
import { parseJsonArray } from '../utils';

const iso = (d: Date | null | undefined): string | null =>
  d ? d.toISOString() : null;

export function toEntry(e: PEntry): Entry {
  return {
    id: e.id,
    entryNumber: e.entryNumber,
    rawDump: e.rawDump,
    status: e.status as EntryStatus,
    toneUsed: (e.toneUsed as Tone) ?? null,
    title: e.title,
    summary: e.summary,
    aiAnalysis: e.aiAnalysis,
    reflectiveQuestion: e.reflectiveQuestion,
    moodScore: e.moodScore,
    emotions: parseJsonArray(e.emotions),
    themes: parseJsonArray(e.themes),
    isConcern: e.isConcern,
    concernStatus: (e.concernStatus as ConcernStatus) ?? null,
    wordCount: e.wordCount,
    aiError: e.aiError,
    processedAt: iso(e.processedAt),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export function toTask(
  t: PTask & { entry?: { entryNumber: number } | null },
): Task {
  return {
    id: t.id,
    title: t.title,
    status: t.status as TaskStatus,
    priority: t.priority as Priority,
    source: t.source as TaskSource,
    sourceEntryId: t.sourceEntryId,
    sourceEntryNumber: t.entry?.entryNumber ?? null,
    isConcern: t.isConcern,
    dueDate: iso(t.dueDate),
    completedAt: iso(t.completedAt),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export function toChatSession(s: PChatSession): ChatSession {
  return {
    id: s.id,
    title: s.title,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function toChatMessage(m: PChatMessage): ChatMessage {
  return {
    id: m.id,
    sessionId: m.sessionId,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  };
}

export function toInsight(i: PInsight): Insight {
  return {
    id: i.id,
    text: i.text,
    category: i.category,
    basedOn: i.basedOn,
    createdAt: i.createdAt.toISOString(),
  };
}

export function toPublicUser(u: PUser): PublicUser {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    tone: u.tone as Tone,
    onboarded: !!u.onboardedAt,
    hasApiKey: !!u.geminiApiKeyEnc,
  };
}
