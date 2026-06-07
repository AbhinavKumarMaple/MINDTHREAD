import type {
  Entry,
  Task,
  ChatSession,
  ChatMessage,
  Insight,
  Tone,
  EntryStatus,
  Priority,
  TaskStatus,
  ConcernStatus,
} from '../types';

// Internal user record (includes sensitive fields) — server-only.
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  tone: Tone;
  geminiApiKeyEnc: string | null;
  onboardedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName?: string;
  tone?: Tone;
}

export interface UpdateUserInput {
  displayName?: string;
  tone?: Tone;
  onboardedAt?: Date | null;
  geminiApiKeyEnc?: string | null;
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(input: CreateUserInput): Promise<UserRecord>;
  update(id: string, input: UpdateUserInput): Promise<UserRecord>;
}

export type EntrySort = 'newest' | 'oldest' | 'mood-high' | 'mood-low';

export interface EntryListFilters {
  status?: EntryStatus;
  from?: Date;
  to?: Date;
  search?: string;
  emotion?: string;
  theme?: string;
  concernOnly?: boolean;
  sort?: EntrySort;
}

export interface UpdateEntryInput {
  rawDump?: string;
  status?: EntryStatus;
  toneUsed?: Tone;
  title?: string | null;
  summary?: string | null;
  aiAnalysis?: string | null;
  reflectiveQuestion?: string | null;
  moodScore?: number | null;
  emotions?: string[];
  themes?: string[];
  isConcern?: boolean;
  concernStatus?: ConcernStatus | null;
  wordCount?: number;
  aiError?: string | null;
  processedAt?: Date | null;
}

export interface EntryRepository {
  list(userId: string, filters?: EntryListFilters): Promise<Entry[]>;
  listAll(userId: string): Promise<Entry[]>;
  get(userId: string, id: string): Promise<Entry | null>;
  create(
    userId: string,
    input: { rawDump: string; toneUsed: Tone },
  ): Promise<Entry>;
  update(
    userId: string,
    id: string,
    input: UpdateEntryInput,
  ): Promise<Entry | null>;
  remove(userId: string, id: string): Promise<void>;
  count(userId: string): Promise<number>;
}

export type TaskStatusFilter = 'all' | 'pending' | 'done' | 'concern';
export type TaskSort = 'newest' | 'oldest' | 'priority';

export interface TaskListFilters {
  status?: TaskStatusFilter;
  source?: 'entry' | 'manual';
  from?: Date;
  to?: Date;
  sort?: TaskSort;
}

export interface CreateTaskInput {
  title: string;
  priority?: Priority;
  source?: 'entry' | 'manual';
  sourceEntryId?: string | null;
  isConcern?: boolean;
  dueDate?: Date | null;
}

export interface UpdateTaskInput {
  title?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
}

export interface TaskCounts {
  all: number;
  done: number;
  pending: number;
  concern: number;
}

export interface TaskRepository {
  list(userId: string, filters?: TaskListFilters): Promise<Task[]>;
  get(userId: string, id: string): Promise<Task | null>;
  create(userId: string, input: CreateTaskInput): Promise<Task>;
  createMany(userId: string, inputs: CreateTaskInput[]): Promise<Task[]>;
  update(userId: string, id: string, input: UpdateTaskInput): Promise<Task | null>;
  remove(userId: string, id: string): Promise<void>;
  counts(userId: string): Promise<TaskCounts>;
}

export interface ChatRepository {
  listSessions(userId: string): Promise<ChatSession[]>;
  createSession(userId: string, title?: string): Promise<ChatSession>;
  getSession(
    userId: string,
    id: string,
  ): Promise<{ session: ChatSession; messages: ChatMessage[] } | null>;
  latestSession(userId: string): Promise<ChatSession | null>;
  addMessage(
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<ChatMessage>;
}

export interface InsightRepository {
  list(userId: string): Promise<Insight[]>;
  replaceAll(
    userId: string,
    items: { text: string; category?: string; basedOn?: number }[],
  ): Promise<Insight[]>;
}

export interface Repositories {
  users: UserRepository;
  entries: EntryRepository;
  tasks: TaskRepository;
  chat: ChatRepository;
  insights: InsightRepository;
}
