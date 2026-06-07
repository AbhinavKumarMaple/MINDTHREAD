# MINDTHREAD — Architecture Recommendation: Do We Need a Backend?

> Produced from a 5-lens architecture analysis (persistence/sync, AI-key/LLM integration, privacy/mental-health, cost/ops, offline/platform) plus an adversarial verification pass. Answers the question: *"Do we require a backend, or can we do all processing on the frontend and just store data in a backend?"*

---

## TL;DR (the direct answer)

**No backend is required to build and ship the MVP — every screen, every AI feature, and every analytic can run 100% on the frontend.** The Gemini key is the *user's own* (so there's no shared secret to hide behind a server), and the analytics are just computation over data already in the browser.

**But** the one thing a no-backend app cannot honestly guarantee is **durability of irreplaceable journal data.** On the exact target platform (iOS Safari PWA), browser storage is **silently evicted after ~7 days of inactivity**, and a lost device or "Clear browsing data" wipes everything.

So the honest answer is **nuanced:**
- **No backend** to deliver the *features*.
- **A backend (ideally a managed BaaS) to deliver the *promise*** of a journal you keep for years.

**Recommendation: Build Phase 1 with no backend now — it's the fastest, cheapest path that satisfies every screen — but design the local data layer to be sync-ready, and treat "users must not lose their journal" as the single trigger that flips you to a BaaS.**

---

## What can run entirely on the frontend?

**Essentially the whole app.** Concretely:

### AI orchestration — all direct browser → Gemini calls with the user's key
- `processEntry` (raw dump → title, summary, mood score, emotions, themes, tasks, concern flag) via `generateContent`.
- `generateInsights`, theme/emotion narrative summaries, `recommendations`.
- **AI Chat / RAG** over the user's own entries. With only tens-to-hundreds of entries, the full corpus fits in context or behind a tiny client-side keyword/vector search — **no vector DB, no server retrieval tier**. Use `streamGenerateContent` (SSE) for streaming chat; it works in-browser.

### Analytics — pure client-side, **NO LLM at all**
Mood trend series + averages, emotion frequencies (this-month vs last-month %), recurring theme counts, streaks, writing-time heatmap, consistency calendar, entry-length trend, concern aggregation. These are plain reductions over your already-processed `Entry[]`. **Only the narrative one-liners need Gemini.**

### Everything else
All 20 screens, sort/filter/calendar views, and persistence against **IndexedDB**.

> The **only** hard network dependency is the Gemini call itself — and that's online-only whether or not you have a backend, so a backend buys nothing for it.

> **CORS note:** call the **native** `generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` endpoint. Avoid the OpenAI-compat shim (`/v1beta/openai/...`) — its `x-stainless-*` headers trip CORS preflight, and with no proxy there's nothing to absorb the failure.

---

## Decision matrix

| Criterion | **A. No backend / local-first** | **B. BaaS (Supabase / Firebase)** | **C. Custom backend** |
|---|---|---|---|
| **Data storage** | IndexedDB (Dexie/RxDB). Capacity fine; durability best-effort | Hosted Postgres/doc store as source of truth + IndexedDB cache | Self-run DB; you own schema, migrations, backups |
| **Cross-device sync** | ❌ None — each browser is an isolated silo | ✅ Built-in (realtime/replication), per-user scoping | ⚠️ Possible, but you build & operate all of it |
| **AI key security** | ✅ User's own key, client-side — no shared secret | ✅ Same (key stays client-side; BaaS stores data only) | ⚠️ Same; only a "win" if you switch to a shared key (don't) |
| **Privacy** | ✅ Best — data never leaves device except the Gemini hop | ⚠️ Centralized plaintext = honeypot unless E2E-encrypted | ⚠️ Same honeypot + full custody/compliance burden |
| **Cost (infra)** | ✅ **$0** — static CDN (Vercel/Netlify/Cloudflare Pages) | 🟡 Free tier → paid as you grow; managed | ❌ Highest — server + DB + auth to host/scale/secure |
| **Time-to-MVP** | ✅ **Fastest** — no API contract, static deploy | 🟡 Moderate — schema, RLS, auth, SDK wiring | ❌ Slowest — weeks of undifferentiated plumbing |
| **Offline** | ✅ **Excellent** — instant durable local writes | ✅ Excellent (local cache) + durable sync online | ❌ Poor by default unless you add a cache layer anyway |

**Verdict: A for the MVP, B as the planned graduation. C is the loser** — it adds a server, DB, and auth to build/scale/secure for a single-user app, buying nothing a BaaS doesn't give off the shelf. The *only* thing that would force a custom server is custodying a **shared** Gemini key — and the BYO-key design deliberately avoids that.

---

## Recommended phased path

### Phase 1 — MVP: No backend, local-first PWA
- **Stack:** Vite + React + **React Query**, data in **IndexedDB via Dexie (or RxDB)**.
  - ⚠️ Never put entry/analysis data in `localStorage` — its ~5 MB cap throws `QuotaExceededError` on an append-only journal and breaks the one operation that must never fail: **capture**.
- **AI:** direct browser → Gemini with the user's key.
- **Ship these durability mitigations from day one** (cheap; they convert silent catastrophic loss into a recoverable situation):
  1. Call `navigator.storage.persist()` and **surface grant/deny status** to the user.
  2. **One-tap JSON export *and* import**, prominent — not buried in settings. This is the manual backup escape hatch.
  3. Prompt **"Add to Home Screen"** and warn that clearing browser data deletes the journal.
- **Account-UI honesty:** "Sign out" + the profile header are no-ops without a backend. **Cut them for MVP or clearly label as "coming soon."** Do not ship a "Sign out" that silently wipes local data with no way back — that's user-hostile for a mental-health app.
- **Backend-ready architecture (critical):** model the local store as a *syncable source layer* — stable IDs, `createdAt`/`updatedAt`, upsert/conflict-friendly shapes (RxDB, or a disciplined Dexie schema). This makes Phase 2 **additive, not a rewrite**.

### Phase 2 — Add a BaaS (Supabase / Firebase) as durable source of truth
Keep IndexedDB as the fast local cache; the BaaS becomes the eviction-proof backup + sync target + account store. **It stores journal data only — never the Gemini key.**

**Add the backend the moment ANY of these becomes a *real* (not cosmetic) requirement:**
- **Durability/backup is a promise** ("users must not lose their journal"). On iOS, this is the single strongest trigger.
- **Cross-device** read/write (draft on phone, reflect on laptop).
- **Accounts go live** — "Sign out" + profile must actually function with per-user data.
- **Reliable scheduled push** ("Remind me tomorrow", daily nudges) that fires when the app is closed — needs a server-side Web Push/FCM sender; client timers die when the OS suspends the PWA. **This is the one feature genuinely undeliverable client-side.**
- **Compliance/duty-of-care** around concern flags (auditable, recoverable, access-controlled storage; clinician export).

> If privacy must be preserved when sync is added, the correct form is **zero-knowledge, end-to-end-encrypted** sync (server holds ciphertext only) — not a plaintext app backend.

---

## How React Query fits — in BOTH cases

React Query is your async-state/cache layer **either way**, which is exactly why this decision doesn't lock you in.

- **No-backend (Phase 1):** React Query wraps **async functions**, not HTTP. `queryFn`/`mutationFn` call into Dexie/RxDB (e.g. `useQuery(['entries'], () => db.entries.toArray())`) and into Gemini (`useMutation` for `processEntry`/chat). You still get loading/error states, retries on the flaky Gemini call, request dedup, and **optimistic updates + cache invalidation** — all over local data and direct API calls.
- **BaaS (Phase 2):** the **same** `queryFn`/`mutationFn` signatures now call the BaaS SDK (or a local-first sync engine) instead of raw Dexie. Wire BaaS realtime events to `queryClient.invalidateQueries` / `setQueryData`. Components and hooks are largely unchanged.

> **Portable rule:** keep the data-access boundary behind React Query hooks. Swapping `queryFn` from IndexedDB to BaaS is an internal change, not a UI rewrite.

---

## The caveats you must accept to go no-backend

1. **Silent, irreversible data loss on the exact target platform.** iOS Safari/WebKit ITP evicts IndexedDB **and** localStorage after ~7 days of no interaction; `navigator.storage.persist()` is often **denied** on iOS. "Clear browsing data", private mode, device loss/upgrade, and PWA uninstall also wipe everything. → **You MUST ship `persist()` + export/import + the ATS warning.**
2. **Gemini key lives in client storage.** Acceptable because it's the **user's own** key (the "never ship keys client-side" rule targets a *shared developer* key, which this design doesn't have). But it's readable by any XSS / malicious dependency, so your real mitigations are a strict **Content-Security-Policy + dependency hygiene**. If a backend is ever added, it must **never** custody this key.
3. **The account model is cosmetic** without a backend. Ship "Sign out"/profile as clearly-future, or cut them.
4. **No cross-device sync, and degraded reminders.** Entries are trapped in one browser; "Remind me tomorrow" is best-effort until Phase 2.

---

## Bottom line

> **Ship Phase 1 no-backend now** — cheapest, fastest, satisfies every screen — **but build the local layer sync-ready** and treat *"users must not lose their journal"* as the trigger that flips you to a BaaS (Supabase recommended: Postgres + Auth + realtime sync, minimal server code).

This directly answers your question: **yes, you can do all processing on the frontend.** "Store the data in a backend" is **optional and deferrable** — start on-device, and add a thin managed backend (not a custom server) only when durability, sync, accounts, or reliable reminders become real requirements.

> **Access control & local→hosted migration:** the requirement that "not just anyone can open the site and access the data," and the plan to start on a local DB and later replace it with a hosted one, are designed in **[05-security-and-auth.md](05-security-and-auth.md)** — app-lock + encrypted IndexedDB now, Supabase Auth + RLS (optionally E2E-encrypted) later, behind a Repository/Auth seam so the swap is additive.
