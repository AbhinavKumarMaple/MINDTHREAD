# MINDTHREAD — Final Implementation Architecture

> Supersedes the stack choices in earlier docs per the latest decision. The product spec ([01](01-overview.md)–[03](03-data-model.md)) is unchanged; only the **tech/architecture** changed.

## Decisions
- **Framework:** **Next.js (App Router, TypeScript)** — full-stack: frontend **and** backend (Route Handlers) in **one project at the repo root** (no subfolder).
- **Database:** **SQLite via Prisma** as the *local* DB now. Accessed **only** through a **repository layer** (interfaces + Prisma implementation) so the store can be **swapped to Supabase/Postgres later** by changing one implementation + the Prisma datasource — "replace the DB and everything keeps working."
- **Auth:** **our own authentication system** — email + password, hashed with bcrypt, **signed HTTP-only cookie sessions** (JWT via `jose`). No third-party auth provider. Middleware gates all app routes, so "not just anyone can open it" — every screen is behind login, and every row is scoped to the authenticated user.
- **Client data:** **TanStack Query (React Query)** for all reads/writes against our API routes.
- **AI:** **Gemini proxied through our backend** using the user's own API key (stored **encrypted at rest**, AES-256-GCM). Keeps the key out of the browser and matches "we have a backend."
- **Styling:** **Tailwind CSS** with a dark-theme token set extracted from the design.
- **Charts:** Recharts (mood line, emotion/length bars).

## The swap seam (local → hosted)
```
UI → React Query hooks → /api routes → Repository interface → PrismaSqlite impl → SQLite
                                                            ↘ (later) Supabase impl → Postgres
```
- Nothing outside `lib/repositories/prisma/*` imports Prisma. API routes call `repositories.entries.list(userId, ...)` etc.
- Swapping to Supabase = add `lib/repositories/supabase/*` implementing the same interfaces, flip the export in `lib/repositories/index.ts`, point Prisma/Postgres or the Supabase client at the hosted DB. UI and API contracts unchanged.

## Project layout (root)
```
app/            # routes: (auth), (onboarding), (app) shell, api/*
components/      # ui/, layout/, journal/, tasks/, analysis/, chat/
lib/            # db, auth, repositories, ai, analytics, crypto, validation, query hooks
prisma/         # schema.prisma, seed.ts, dev.db
middleware.ts   # auth gate
docs/           # this documentation
```

## Auth model
- `User { id, email, passwordHash, displayName, tone, geminiApiKeyEnc }`
- Login → bcrypt verify → issue JWT (HS256, `AUTH_SECRET`) in `httpOnly` cookie → middleware verifies on every `(app)` request → `getCurrentUser()` in handlers resolves `userId`. Logout clears the cookie.
- All data tables carry `userId`; repositories always filter by it (the app-level equivalent of Postgres RLS, ready to become real RLS on Supabase).
