// Shared domain types. The API serializes dates as ISO strings, so the
// client-facing shapes use `string` for timestamps.

export type Tone = 'blunt' | 'warm' | 'analytical' | 'close_friend';
export type EntryStatus = 'draft' | 'processing' | 'processed' | 'error';
export type TaskStatus = 'pending' | 'done';
export type Priority = 'low' | 'normal' | 'high';
export type TaskSource = 'entry' | 'manual';
export type ConcernStatus = 'unresolved' | 'improving' | 'resolved';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  tone: Tone;
  onboarded: boolean;
  hasApiKey: boolean;
}

export interface Entry {
  id: string;
  entryNumber: number;
  rawDump: string;
  status: EntryStatus;
  toneUsed: Tone | null;
  title: string | null;
  summary: string | null;
  aiAnalysis: string | null;
  reflectiveQuestion: string | null;
  moodScore: number | null;
  emotions: string[];
  themes: string[];
  isConcern: boolean;
  concernStatus: ConcernStatus | null;
  wordCount: number;
  aiError: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  source: TaskSource;
  sourceEntryId: string | null;
  sourceEntryNumber: number | null;
  isConcern: boolean;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  text: string;
  category: string | null;
  basedOn: number;
  createdAt: string;
}

// ---- Derived analytics (computed, not stored) ----
export interface MoodPoint {
  date: string;
  entryId: string;
  title: string | null;
  moodScore: number;
}

export interface EmotionStat {
  name: string;
  count: number;
  thisPeriodPct: number;
  prevPeriodPct: number;
}

export interface ThemeStat {
  name: string;
  count: number;
  entryIds: string[];
}

export interface AnalyticsSummary {
  totalEntries: number;
  processedEntries: number;
  streakDays: number;
  avgMood: number | null;
  moodTrend: MoodPoint[];
  topEmotions: EmotionStat[];
  topThemes: ThemeStat[];
  concernCount: number;
  totalWords: number;
}

// The structured result the AI returns for a processed entry.
export interface ProcessedResult {
  title: string;
  summary: string;
  moodScore: number;
  emotions: string[];
  themes: string[];
  reflectiveQuestion: string;
  isConcern: boolean;
  tasks: { title: string; priority: Priority }[];
  aiAnalysis: string;
}
