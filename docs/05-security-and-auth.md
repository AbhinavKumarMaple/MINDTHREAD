# MINDTHREAD — Security, Access Control & the Local → Hosted Migration Path

> Added per requirement: *"start with a local DB and later replace it with a hosted one, but security is also important — not just anyone should be able to open the site and access it."*
>
> This doc defines the **threat model**, the **access-control options**, and an **architecture that lets us swap local → hosted without a rewrite**. It refines the backend decision in [04-architecture-recommendation.md](04-architecture-recommendation.md).

---

## 1. First, a crucial distinction

There are **two different things** people mean by "not anyone can access it":

| What | Means | How you protect it |
|---|---|---|
| **A. The app shell** (HTML/JS/CSS) | The static code that renders the UI | Normally **public** — it's just code. Hiding it needs edge auth (Cloudflare Access, login wall). Rarely necessary. |
| **B. The journal data** (entries, moods, concerns) | The user's actual private content | **This is what must be locked.** A passphrase/login gates it; encryption makes it unreadable without the key. |

**For MINDTHREAD, the real requirement is B.** Locking the *data* (so no one can read a journal without authenticating) is what matters. Whether the app shell at `app.mindthread.com` is publicly loadable is mostly irrelevant — loading the page shows a **locked screen**, not anyone's journal.

> If you genuinely want to prevent the site from even *loading* for non-allowlisted people (e.g., a private beta), that's a separate, optional layer — put **Cloudflare Access / Vercel password protection** in front of the static deploy. It's a 5-minute config, independent of the app's own auth. We can add it anytime.

---

## 2. Threat model (what we defend against)

| Threat | Phase 1 (local) | Phase 2 (hosted) |
|---|---|---|
| **Shared/again-opened device** — someone opens the browser and reads the journal | 🔒 App lock + encrypted-at-rest store | 🔒 Same lock + server session |
| **Public URL** — a stranger navigates to the site | They see a **locked/login screen**, no data | They see a **login screen**, no data |
| **Lost/stolen device** | Data is AES-encrypted; useless without passphrase | Same, + remote sign-out / session revoke |
| **Host/database breach** | N/A (no host) | Mitigated by RLS; eliminated by optional **E2E encryption** (host stores ciphertext) |
| **XSS / malicious dependency** | Reads in-memory key/data | Same — mitigated by strict **CSP + dependency hygiene** (applies to both phases) |
| **The user's Gemini API key leaking** | Encrypt it in the local store alongside data | Never store it server-side; keep it client-side encrypted |

---

## 3. Phase 1 — Local DB with real access control (no backend)

**Goal: data on-device, but locked and encrypted, so opening the browser is not enough to read it.**

### 3.1 The lock
- On first run, the user sets a **passphrase** (or PIN). Optionally enable **biometric/passkey unlock** (WebAuthn) for convenience.
- The passphrase is **never stored**. It derives an encryption key via **Argon2id** (or PBKDF2 with high iterations) using the WebCrypto API.
- The derived key lives **only in memory** while the app is unlocked; it's re-derived on each unlock. Auto-**lock on idle / tab close**.

### 3.2 Encryption at rest
- All sensitive records (entries, AI analysis, chat, the Gemini API key) are encrypted with **AES-GCM** before being written to **IndexedDB**.
- Without the passphrase, the IndexedDB contents are ciphertext — useless to anyone who opens the browser or copies the profile.
- Non-sensitive UI state (theme, last tab) can stay plaintext.

### 3.3 What this gives us
- ✅ Real at-rest protection on shared/lost devices, **with zero backend**.
- ✅ The "not anyone can access it" requirement is met locally: open the site → **Unlock** screen → data only after correct passphrase.
- ✅ The same passphrase-derived key is reusable for **E2E encryption** when we move to hosted (Section 4.3) — so this isn't throwaway work.

### 3.4 Trade-offs to accept
- **Forgotten passphrase = unrecoverable data** (that's the point of zero-knowledge). Mitigate with an optional **recovery code** at setup and the **export** escape hatch from [04](04-architecture-recommendation.md).
- App-shell code is still public (see §1) — fine.

---

## 4. Phase 2 — Replace local DB with a hosted one (Supabase recommended)

When durability/sync/accounts become real requirements, swap the storage layer. **Supabase** is the recommended BaaS: hosted Postgres + Auth + Row-Level Security + realtime, minimal server code. (Firebase is the equivalent alternative.)

### 4.1 Real authentication
- **Supabase Auth**: email/password, magic-link, OAuth (Google/Apple), and/or **passkeys**. This is the "login so not anyone can access it" at the account level.
- A session (JWT) is required to read/write; signing out revokes client access — making "Sign out" in the hamburger menu **functional** (it's cosmetic today).

### 4.2 Per-user isolation (the important part)
- **Row-Level Security (RLS)**: every row carries `user_id`; policies enforce `user_id = auth.uid()`. Even with the public anon key in the browser, **a user can only ever read their own data**. This is what actually makes the hosted DB safe to expose to the client.
- Data encrypted **in transit** (TLS) and **at rest** (managed Postgres).

### 4.3 Optional: zero-knowledge E2E (max privacy for mental-health data)
- Reuse the Phase-1 passphrase key to **encrypt entries client-side before upload**. The host stores **ciphertext only** and can't read journals even if breached or subpoenaed.
- Trade-off: server-side search/analytics on content become impossible (fine — our analytics are client-side anyway). Recommended for the sensitive "concern" data.

---

## 5. The swap-without-rewrite architecture

This is what makes "start local, replace later" cheap. Two abstractions, both consumed through React Query:

```
            UI (React components)
                  │  useEntries(), useTasks(), useAuth() ...
                  ▼
        React Query hooks (stable API)
                  │  queryFn / mutationFn
                  ▼
        ┌──────────────────────────┐
        │   Repository interface   │   ← the seam we swap
        │  get/put/list/delete...  │
        └────────────┬─────────────┘
        Phase 1      │      Phase 2
        ┌────────────┴─────────────┐
        ▼                          ▼
 LocalRepository            SyncRepository
 (Dexie + AES-GCM)          (Supabase + local cache)

        ┌──────────────────────────┐
        │     Auth interface       │   ← unlock vs login
        └────────────┬─────────────┘
        Phase 1      │      Phase 2
   LocalAuth (passphrase)   SupabaseAuth (session)
```

- **Repository interface**: all data access goes through one TypeScript interface (`EntriesRepo`, `TasksRepo`, …). Phase 1 implements it with encrypted Dexie; Phase 2 with Supabase (keeping Dexie as a cache). React Query's `queryFn`/`mutationFn` only ever call the interface, so **components don't change**.
- **Auth interface**: `useAuth()` exposes `status: 'locked' | 'unlocked'` (Phase 1) which maps to `'signed-out' | 'signed-in'` (Phase 2). The same **gate component** wraps the app in both phases.
- **Migration**: when the user first signs in (Phase 2), upload the local encrypted store to Supabase, then keep both in sync. Additive, not a rewrite.

> **Rule:** never let a component import Dexie or Supabase directly. They import hooks; hooks call the repository. That single discipline is what delivers the painless swap.

---

## 6. Options summary — pick the access-control posture

| Option | What it is | Security | Effort | When |
|---|---|---|---|---|
| **0. No lock** | Open app, data in plaintext IndexedDB | ❌ Anyone on the device reads it | — | Not acceptable given your requirement |
| **1. App lock + encrypted local store** ✅ | Passphrase → AES-GCM encrypt IndexedDB; in-memory key; auto-lock | ✅ Strong at-rest, zero backend | Low–Med | **Phase 1 (recommended start)** |
| **+ Edge gate (optional)** | Cloudflare Access / host password in front of the static site | ✅ Site won't even load for outsiders | Tiny config | If you want a private beta |
| **2. Hosted auth + RLS** | Supabase Auth + per-user row security | ✅ Real accounts, per-user isolation, sync, backup | Med | **Phase 2 (the "hosted DB")** |
| **3. Hosted auth + RLS + E2E** | Above, plus client-side encryption so host stores ciphertext | ✅✅ Max privacy for mental-health data | Med–High | Phase 2 if privacy is paramount |

### Recommended path that matches your ask
1. **Phase 1 (now):** Local DB (**encrypted IndexedDB**) + **app-lock passphrase** → satisfies "local DB" + "not anyone can access it," no backend. Build behind the Repository/Auth interfaces so the swap is free. *(Optionally add an edge password if you want the site itself non-public during dev.)*
2. **Phase 2 (later):** Replace `LocalRepository` with **Supabase** (Auth + RLS) for the hosted DB, reusing the same hooks — and **carry the passphrase key into E2E encryption** so the hosted store never sees plaintext journals.

This is a continuous path: the security work in Phase 1 (passphrase, encryption, gate component) is exactly what Phase 2 builds on.
