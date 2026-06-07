# MINDTHREAD

> "Your second mind." An AI-powered journaling app — write a raw brain dump, let Gemini refine it into a structured entry (mood, emotions, themes, tasks, concern flags), and explore your patterns over time.

Built with **Next.js (App Router) · TypeScript · TanStack Query · Tailwind · Prisma (SQLite) · custom auth**.

## Quick start

```bash
npm install            # install deps (also runs prisma generate)
npm run db:push        # create the SQLite database from the schema
npm run db:seed        # seed a demo account + sample journal
npm run dev            # http://localhost:3000
```

**Demo login:** `demo@mindthread.app` / `demo12345`

To use the AI features (Process an entry, Chat, generate Insights), add your own
**Gemini API key** in **Settings** — it's encrypted at rest before being stored.

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Sync schema → SQLite |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

## Architecture (how it's wired)

```
UI (app/**)
  → TanStack Query hooks (lib/query/hooks.ts)
    → /api/** route handlers (app/api/**)
      → repositories (lib/repositories)  ← the swap seam
        → Prisma → SQLite (prisma/dev.db)
```

- **Custom auth** (`lib/auth/*`): email + bcrypt password, signed **HTTP-only cookie** sessions (JWT via `jose`). `middleware.ts` gates every page; every row is scoped to the authenticated user. So "not just anyone can open it" — the app is fully behind login.
- **Repository layer** (`lib/repositories`): all data access goes through interfaces. **Nothing outside `lib/repositories/prisma.ts` imports Prisma.**
- **AI** (`lib/ai/*`): Gemini is called **server-side** with the user's own key (stored AES-256-GCM encrypted). `processEntry`, `chatReply`, `generateInsights`.
- **Analytics** (`lib/analytics.ts`): mood trends, emotion %, themes, habits, concerns — pure computation over entries, no LLM.

### Swapping SQLite → Supabase/Postgres later
This is intentionally a one-place change:
1. Add `lib/repositories/supabase.ts` implementing the same `Repositories` interfaces.
2. Flip the export in `lib/repositories/index.ts`.
3. Point Prisma's datasource (or the Supabase client) at Postgres.

The UI, API contracts, hooks, and auth are untouched. See [docs/06-implementation-architecture.md](docs/06-implementation-architecture.md).

## Project layout
```
app/            (auth) login/signup · onboarding · (app) journal/tasks/analysis/chat/settings · api/*
components/      ui/ · layout/ · journal/ · tasks/ · analysis/
lib/            db · auth · crypto · repositories · ai · analytics · validation · query
prisma/         schema.prisma · seed.ts · dev.db
middleware.ts   auth gate
docs/           product + design + architecture documentation
```

## Screens
Onboarding (tone) · Journal list · Entry editor (draft → **Process**) · Processed entry · Tasks (list, calendar, filters) · AI Analysis dashboard · Mood trend · Emotion detail · Theme detail · Habits · Concern tracker · Insights · Recommendation · AI Chat · Settings · Hamburger drawer.

## Environment (`.env`)
```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<long random string>"
ENCRYPTION_KEY="<64 hex chars / 32 bytes>"
```
