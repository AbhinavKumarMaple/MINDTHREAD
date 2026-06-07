# MINDTHREAD — Data Model & AI Operations

> Derived from the screens in [02-screens.md](02-screens.md). This defines the **entities**, their **relationships**, and the **AI (Gemini) operations** the app performs. It is storage-agnostic: the same model maps onto IndexedDB (local-first) or a backend DB. See [04-architecture-recommendation.md](04-architecture-recommendation.md).

---

## 1. Entity overview

```
Profile (1) ─────────── settings, tone, gemini key

Entry (N) ──┬── emotions[]      (tags)
            ├── themes[]        (tags → aggregate into Theme)
            ├── moodScore       (→ MoodTrend series)
            ├── isConcern       (→ Concern)
            └── tasks[]  ◄────── Task.sourceEntryId (1 entry → N tasks)

Derived/aggregated from Entry[] (recomputed, not primary truth):
  Theme, EmotionStat, MoodTrend, HabitStats, Concern, Insight, Recommendation

ChatSession (N) ── ChatMessage (N)   (context = selected Entry[])
```

**Primary (user/AI-authored) data:** `Profile`, `Entry`, `Task`, `ChatSession/ChatMessage`.
**Derived data:** `Theme`, `EmotionStat`, `MoodTrend`, `HabitStats`, `Concern`, `Insight`, `Recommendation` — all computable from `Entry[]` (+ `Task[]`). These can be cached, but should be **regenerable** so they never become a separate source of truth that can drift.

---

## 2. Entities (suggested TypeScript shapes)

```ts
type ID = string;            // uuid
type ISODate = string;       // ISO 8601
type Tone = 'blunt' | 'warm' | 'analytical' | 'close_friend';
type EntryStatus = 'draft' | 'processing' | 'processed' | 'error';
type TaskStatus = 'pending' | 'done';
type Priority = 'low' | 'normal' | 'high';
type ConcernStatus = 'unresolved' | 'improving' | 'resolved';

interface Profile {
  id: ID;
  displayName: string;            // "Journal"
  tone: Tone;                     // chosen in onboarding/settings
  geminiApiKey?: string;          // stored locally (see security notes)
  createdAt: ISODate;
  // future: reminders, theme, notificationPrefs
}

interface Entry {
  id: ID;
  entryNumber: number;            // human "Entry #6"
  createdAt: ISODate;            // when written
  rawDump: string;                // freeform user text (source of truth)
  status: EntryStatus;
  toneUsed?: Tone;

  // AI-generated (after PROCESS):
  title?: string;
  summary?: string;
  moodScore?: number;             // 0..10
  emotions?: string[];            // ["anxious","reflective"]
  themes?: string[];              // ["self-doubt","work-stress"]
  aiAnalysis?: string;            // longer narrative / reflective question
  isConcern?: boolean;            // flagged by AI
  concernStatus?: ConcernStatus;
  wordCount?: number;
  processedAt?: ISODate;
  aiError?: string;
}

interface Task {
  id: ID;
  title: string;
  status: TaskStatus;
  priority: Priority;
  source: 'entry' | 'manual';
  sourceEntryId?: ID;             // when source === 'entry'
  isConcern?: boolean;
  dueDate?: ISODate;
  createdAt: ISODate;
  completedAt?: ISODate;
}

interface ChatSession {
  id: ID;
  title?: string;
  createdAt: ISODate;
  contextEntryIds?: ID[];         // entries used as RAG context
}
interface ChatMessage {
  id: ID;
  sessionId: ID;
  role: 'user' | 'assistant';
  content: string;
  createdAt: ISODate;
}

// ---- Derived (cache; regenerable from Entry[]) ----
interface ThemeAgg { name: string; entryIds: ID[]; aiAnalysis?: string; relatedThemes: string[]; }
interface EmotionStat { name: string; thisPeriodPct: number; prevPeriodPct: number; triggers: string[]; entryIds: ID[]; }
interface MoodPoint { date: ISODate; entryId: ID; moodScore: number; }
interface HabitStats { streakDays: number; totalEntries: number; totalWords: number; writingTimeHistogram: number[]; consistency: Record<string, number>; lengthTrend: number[]; }
interface Insight { id: ID; text: string; basedOnEntryIds: ID[]; category?: string; createdAt: ISODate; }
interface Recommendation { id: ID; title: string; rationale: string; basedOnCount: number; whyItWorks: string[]; tryPrompt: string; status: 'new' | 'snoozed' | 'done'; }
```

---

## 3. Relationships
- **Profile 1 — N Entry, 1 — N Task, 1 — N ChatSession** (single local user).
- **Entry 1 — N Task** via `Task.sourceEntryId` (the "Entry #" links on the Tasks screen).
- **Entry N — N Theme/Emotion** via string tags, aggregated into `ThemeAgg` / `EmotionStat`.
- **Concern** is a view over `Entry where isConcern === true` (+ `concernStatus`).
- **MoodTrend** is the ordered series of `(createdAt, moodScore)` over `Entry`.
- **ChatSession N — context — Entry** (retrieval references, not ownership).

---

## 4. AI (Gemini) operations

All AI features are calls to **Google Gemini** using the user's API key + a tone-aware system prompt. None of them inherently require a server (the user's key calls Gemini directly); a server is only needed if you choose to **hide a shared key** or **offload heavy retrieval** (discussed in the architecture doc).

| # | Operation | Trigger | Input | Output (parsed) | Needs LLM? |
|---|---|---|---|---|---|
| 1 | **processEntry** | PROCESS button | `rawDump`, `tone`, recent context | `{title, summary, moodScore, emotions[], themes[], tasks[], isConcern, aiAnalysis}` | ✅ |
| 2 | **extractTasks** | within processEntry / "Mark as Task" | entry text | `[{title, priority}]` | ✅ (or rule-based) |
| 3 | **generateInsights** | on dashboard open / new entries | recent `Entry[]` (summaries) | `Insight[]` | ✅ |
| 4 | **generateRecommendations** | dashboard | aggregated stats + entries | `Recommendation[]` | ✅ |
| 5 | **themeAnalysis** | theme-detail open | entries tagged with theme | narrative + relatedThemes | ✅ |
| 6 | **emotionAnalysis** | emotion-detail | entries with emotion | triggers + narrative | ✅ |
| 7 | **chat (RAG)** | ai-chat send | message + selected entries as context | assistant reply | ✅ |
| 8 | **contextualNudge** | opening editor | time-of-day, recent patterns | banner text + suggested action | ✅ or rule-based |
| 9 | **mood/emotion/theme/habit aggregation** | always | `Entry[]` | counts, %, series, streaks | ❌ pure client compute |

**Important:** operation #9 — the bulk of the "AI Analysis" *numbers* (mood averages, emotion %, streaks, consistency, entry-length trends, "X of N entries") — is **plain data computation over already-processed entries**. It does **not** call the LLM. The LLM is only needed to (a) process raw dumps into structure, and (b) write the *narrative* parts (insights, recommendations, theme/emotion summaries, chat).

### Prompt design notes
- Maintain one **system prompt template** parameterized by `tone`.
- **processEntry** should request **structured JSON** output (Gemini `responseMimeType: application/json` + a response schema) so the client can store fields reliably.
- For **chat/RAG**, select context client-side: filter `Entry[]` by recency/relevance (and/or keyword/embedding match), pass summaries (not full text) to stay within token limits.
- Handle: missing/invalid key, rate limits, partial/invalid JSON (retry), and offline (queue PROCESS for later).

---

## 5. Storage view
- **Collections:** `profile` (1 doc), `entries`, `tasks`, `chatSessions`, `chatMessages`. Derived caches: `insights`, `recommendations`, plus computed-on-read aggregates.
- **Indexes needed:** entries by `createdAt`, by `status`, by `isConcern`, by emotion/theme (for filters); tasks by `status`, `sourceEntryId`, `dueDate`.
- **Filters/sorts the UI requires** (from sort-filter + date-range + status chips): sort by newest/oldest/priority/status; date range (incl. custom); source (entry vs manual); task status (all/done/pending/concern).
- This maps cleanly to **IndexedDB (via Dexie)** for local-first, or to Postgres/Firestore tables with the same shape if a backend is added.
