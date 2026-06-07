# MINDTHREAD — Documentation

Reverse-engineered from the Pencil design `untitled.pen`. Read in order:

1. **[01-overview.md](01-overview.md)** — what the app is, design system (colors/type/components), navigation model, full 20-screen inventory, and gaps to confirm.
2. **[02-screens.md](02-screens.md)** — detailed spec for each of the 20 screens (elements, states, interactions).
3. **[03-data-model.md](03-data-model.md)** — entities, relationships, and the catalog of AI (Gemini) operations.
4. **[04-architecture-recommendation.md](04-architecture-recommendation.md)** — **the backend question, answered**: do we need a backend? (Short answer: not for the MVP — go local-first, add a BaaS later.)
5. **[05-security-and-auth.md](05-security-and-auth.md)** — **access control + the local→hosted migration path**: how to lock the data so "not anyone can open it," and how to swap a local DB for a hosted one (Supabase) without a rewrite.

## One-line summary
**MINDTHREAD** is an AI journaling app (mobile, dark theme): write a raw "brain dump" → **PROCESS** with Gemini → get a structured entry (title, mood, emotions, themes, tasks, concern flags) → browse derived **AI Analysis** (mood trends, insights, habits, concerns) and **chat** with an AI about your own journal.

## Planned stack
Vite · React · React Query · **encrypted IndexedDB** (local-first, app-lock passphrase) — **no backend for the MVP**; swap to **Supabase** (Auth + RLS, optional E2E) later for the hosted DB, sync, backup, and accounts. Built behind a Repository/Auth seam so the local→hosted swap is additive, not a rewrite. See [05-security-and-auth.md](05-security-and-auth.md).

## Status
Documentation + architecture decision complete. Implementation not yet started (awaiting go-ahead and a few product decisions — see the open questions in [01-overview.md](01-overview.md#possible-gaps--things-missing-in-the-design-to-confirm-with-user)).
