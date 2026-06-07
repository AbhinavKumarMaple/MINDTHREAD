# MINDTHREAD — Local-First Sync & Client-Side AI

> Adds a **browser-local cache (IndexedDB)** that syncs from the cloud DB, and moves **AI execution into the browser** (browser → Gemini directly) using the locally-cached key. Refines [06-implementation-architecture.md](06-implementation-architecture.md).

## The model

```
Cloud DB (source of truth)            Browser-local DB (cache)
  SQLite → Supabase later               IndexedDB (Dexie)
        │                                     ▲
        │   GET /api/sync (on login/mount)    │
        └─────────────────────────────────────┘
              profile (incl. decrypted key) + entries + tasks

AI request (process / chat / insights):
  read key from IndexedDB ──► present? ──► browser calls Gemini directly ──► POST result to cloud DB
                                │ missing
                                ▼
                       syncAll() (one backend call fetches ALL data) → cache → retry
```

- **Cloud DB** stores everything and is the source of truth. The Gemini key is stored **encrypted** (AES-256-GCM).
- **`GET /api/sync`** returns a full snapshot — profile (with the **decrypted** key), entries, tasks — so one call hydrates the local cache.
- **Local DB (IndexedDB via Dexie)** caches that snapshot. AI reads the key from here, so we never query the backend just to check/get the key.
- **AI runs in the browser**: `browser → https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` (native endpoint — CORS-safe, avoids the OpenAI-compat shim). The structured result is then POSTed to the cloud DB to persist.

## Key resolution (the required algorithm)
`lib/local/profile.ts → getGeminiKey()`:
1. Read `profile` from IndexedDB.
2. If absent → `syncAll()` (fetch all data from backend → cache) → read again.
3. Return the key (or `null`).

So the backend is hit for the key **only on a cache miss**, never on every AI request.

## Files
| File | Role |
|---|---|
| `app/api/sync/route.ts` | Snapshot endpoint (decrypted key + entries + tasks + profile) |
| `lib/local/db.ts` | Dexie schema (`profile`, `entries`, `tasks`) — lazy, browser-only |
| `lib/local/sync.ts` | `syncAll()` (dedup'd), `clearLocal()` |
| `lib/local/profile.ts` | `getGeminiKey()`, `getLocalProfile()`, `getLocalEntries()`, `setLocalKey()` |
| `lib/ai/gemini.ts` | Gemini SDK calls — now **client-side** (processEntry, chatReply, generateInsights) |
| `lib/query/hooks.ts` | `useProcessEntry` / `useSendChat` / `useRefreshInsights` resolve the key locally + call Gemini in the browser, then save |
| `lib/ai/service.ts` | Server-side **save-only** helpers (no Gemini): `saveProcessedEntry`, `saveChatExchange`, `saveInsights` |

## Lifecycle
- **App mount** (`app/(app)/layout.tsx`): `syncAll()` refreshes the cache.
- **Login / signup**: `clearLocal()` (wipe any previous account's cache); next access re-syncs.
- **Logout**: `clearLocal()` + clear React Query cache.
- **Settings → save key/tone**: updates the IndexedDB cache directly (`setLocalKey` / `setLocalProfileFields`) so AI uses the new value immediately, no re-sync.

## Verified (browser test)
- IndexedDB `mindthread` hydrated on login: profile + 7 entries + 8 tasks.
- Saving a key flips the cached `hasKey` to `true` instantly.
- Process → observed `POST https://generativelanguage.googleapis.com/v1beta/...:generateContent` **from the browser** (400 with the test key — no CORS block). With a valid key it returns 200 and the result is saved.

## Trade-offs accepted
- The **decrypted key lives in the browser** (IndexedDB + memory). Acceptable because it's the user's *own* key (per [04](04-architecture-recommendation.md)); mitigate with strict CSP + dependency hygiene.
- The Gemini SDK ships in the client bundle (larger JS on AI pages).
- When the DB swaps to Supabase, `/api/sync` (and the repository layer) is the only server piece that changes; the local-first client is unaffected.
