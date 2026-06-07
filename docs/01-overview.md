# MINDTHREAD — Product & Design Overview

> Source of truth: the Pencil design file `untitled.pen`.
> This document is reverse-engineered from the design. It describes **what the app is**, the **design system**, **navigation**, and a **full screen inventory**. Detailed per-screen specs live in [02-screens.md](02-screens.md); the data model and AI operations live in [03-data-model.md](03-data-model.md).

---

## 1. What is MINDTHREAD?

**MINDTHREAD — "your second mind."** is an AI-powered personal **journaling** app (mobile / phone form factor, 390×844, dark theme).

The core idea: you write raw, unfiltered thoughts (a "brain dump"), and an LLM (Google **Gemini**) refines them into something meaningful — a structured entry with a title, summary, mood score, emotions, recurring themes, and extracted to-dos. Over time, the app surfaces **patterns and insights** about your mental state and habits, and lets you **chat with an AI** about your own journal.

It positions itself as a *"sanctuary for raw thought, refined by artificial intelligence to uncover patterns and promote clarity."*

### The core loop
```
Write brain dump  →  PROCESS (Gemini)  →  Structured entry
   (editor-draft)                          (title, summary, mood, emotions,
                                            themes, tasks, concern flag)
                                                      │
                                                      ▼
                          Aggregated over many entries
                                                      │
                ┌─────────────────┬───────────────────┬──────────────────┐
                ▼                 ▼                   ▼                  ▼
           Mood trends      Emotion stats        Themes/Concerns     AI Chat (RAG)
           Habits           Insights             Recommendations     over your entries
```

### The three primary tabs
The HOMESCREEN organizes everything under three tabs:
1. **Notes** — the journal (list of entries grouped by day).
2. **Tasks** — to-dos, mostly auto-extracted from entries.
3. **AI Analysis** — the analytics & insights dashboard.

---

## 2. Key product signals (read directly from the design)

These shape every downstream decision, especially the backend question:

| Signal | Where it appears | Implication |
|---|---|---|
| *"Your data is stored **locally**."* | Settings screen | The app is designed **local-first**. |
| *"An **API key** is required for AI processing features."* + Gemini API key field | Settings screen | **Bring-your-own-key**: the user supplies their own Gemini key; AI calls go directly to Gemini. |
| Choose an AI **tone** (Blunt / Warm / Analytical / Close Friend) | Onboarding + Settings | The LLM system prompt is personalized per-user. |
| **PROCESS** button on a draft | editor-draft | AI runs on-demand, per entry (not continuously). |
| Tasks linked to "Entry #6" etc. | tasks view | Tasks are **derived from** entries (with manual add too). |
| "Sign out" + "mindthread user" | Hamburger menu | A *hint* that optional accounts may be intended later (not wired to the local-storage model). |
| "Remind me tomorrow" | Recommendation screen | Implies local reminders / notifications. |

---

## 3. Design system

No formal design variables/tokens are defined in the `.pen` file yet, so the following is **extracted from the screens** and should become the token set for the build.

### 3.1 Color palette (dark theme)
| Role | Value (approx) | Usage |
|---|---|---|
| Background (deepest) | `#07091A` – `#0A0A14` | Screen backgrounds |
| Surface / card | `#0E0F1E` / `#141424` | Cards, drawers, panels |
| Surface raised | `#1F1F2E`-ish | Chips, inputs, secondary cards |
| Border / divider | `#262447` | Hairline separators, tab underline |
| **Primary / accent (purple)** | `#7C5CBF` → `#8B5CF6` | Brand, active states, gradients, primary buttons (FAB stroke, "Apply" buttons, active tab) |
| **AI accent (orange/amber)** | `#F49E12` | "Ask AI" / "+ AI" button, AI highlights, glow shadow |
| **Action blue** | `#2B78F7` | Filter/sort floating button, secondary actions |
| Success (green) | `#22C55E`-ish | Completed tasks, "DONE", positive mood |
| Warning / concern (red/orange) | `#EF4444` / amber | "CONCERN", flagged entries, high priority |
| Text primary | `#FFFFFF` / `#F5F5F7` | Headings, entry titles |
| Text secondary | `~#9CA3AF` / muted purple | Metadata, captions, timestamps |

The brand leans on **purple ↔ orange** as a duotone, with a glossy/glow treatment on AI affordances (the orange "Ask AI" button has a soft amber drop shadow).

### 3.2 Typography
- A **bold, wide, uppercase** wordmark for "MINDTHREAD" (tracked-out letterspacing).
- Entry titles: large, semibold, serif-feeling display weight.
- Body/metadata: clean sans (Inter-like) at 13–14px, muted.
- Numeric/stat emphasis: large bold numerals (e.g., mood "6.0/10", "75%").
- **Action for build:** pick one display + one text family (e.g., a strong grotesk/serif display + Inter). Confirm with the user before finalizing.

### 3.3 Shape & elevation
- Cards: ~16–20px corner radius, subtle 1px stroke (`#262447`) over a slightly lighter surface.
- Pills/chips: fully rounded (status filters, tags, tone selectors).
- FAB: 64px circle, white fill, purple stroke, drop shadow.
- Floating utility buttons: 44px rounded squares/circles (blue filter, orange AI).
- Effects used: outer drop shadows (incl. a colored amber glow), background overlay `#000000CC` for modals.

### 3.4 Recurring components (build these as reusable first)
- **Status bar** (iOS time + signal/wifi/battery) — top of every screen.
- **Home indicator** — bottom bar on every screen.
- **App header** — hamburger, MINDTHREAD wordmark, tone chip, right-side icons.
- **Tab bar** — Notes / Tasks / AI Analysis (underline active state).
- **Entry card** — title, date/time, "Entry #", emotion tags, status badge (PROCESSED / PROCESSING).
- **Task row** — checkbox, title, priority/source chip, "Entry #" link.
- **Filter chips** — pill toggles (status, sort, source).
- **Stat chip / metric** — number + label.
- **Bar / line chart** — mood trend, emotion bars, entry-length trend (built with layout, per Pencil chart rules).
- **FAB**, **Ask-AI button**, **Filter/sort button** — floating actions.
- **Bottom sheet / overlay** — sort & filter, date range, hamburger drawer.

---

## 4. Navigation model

```
                          ┌────────────────────────┐
   First run ───────────► │  setup-tone-selection  │  (onboarding, pick AI tone)
                          └───────────┬────────────┘
                                      ▼
                          ┌────────────────────────┐
              ┌──────────►│       HOMESCREEN        │◄───────────┐
              │           │  [Notes][Tasks][AI An.] │            │
              │           └──┬─────────┬─────────┬──┘            │
              │   tab: Notes │   tab:  │  tab:    │              │
              │              ▼  Tasks  ▼  AI An.  ▼              │
              │        Journal list  Tasks list  AI dashboard    │
              │              │         │           │             │
   Hamburger  │              │         │           ├─► mood-trend-detail
   drawer ────┤              │         │           ├─► emotion-detail
   (Journal/  │      tap entry│   filters│          ├─► theme-detail
    Tasks/    │              ▼         ▼           ├─► habits-detail
    Insights/ │        editor-draft  sort/filter   ├─► concern-tracker
    Patterns/ │              │      date-range      ├─► all-insights
    Settings) │        PROCESS│      calendar-view  ├─► recommendation-detail
              │              ▼                      └─► ai-chat
              │        editor-processed
              │              │ (Mark as Task → Tasks)
              └──────────────┘
                          ┌────────────────────────┐
   Hamburger "Settings" ► │        settings        │  (tone, Gemini key, about)
                          └────────────────────────┘
```

- **Entry point:** onboarding (tone) on first launch, else HOMESCREEN.
- **Primary nav:** the 3 tabs + the hamburger drawer.
- **The FAB** (+) always creates a new draft entry → `editor-draft`.
- **Floating Ask-AI** opens the AI chat / ask-AI flow.
- **Floating filter/sort** opens the sort-&-filter sheet.

---

## 5. Full screen inventory (20 unique screens)

> The `.pen` file contains **76 frames = ~20 unique screens × 3 design iterations** (three near-identical horizontal rows) plus one unrelated inspiration board (`AICiG`, a Discord/Xbox-style marketing image — **not part of the app**) and a few loose design fragments.

| # | Screen | Pencil ID (row 1) | Purpose |
|---|---|---|---|
| 1 | setup-tone-selection | `v2upiL` | Onboarding: choose AI tone |
| 2 | HOMESCREEN (Notes) | `QfXa6` | Journal list, 3 tabs, FAB |
| 3 | editor-draft | `kdYE3` | Write raw brain dump + PROCESS |
| 4 | editor-processed | `GkQjA` | AI-structured entry view |
| 5 | settings | `S2scK` | Tone, Gemini key, about |
| 6 | hamburger-menu-overlay | `S66am` | Side drawer navigation |
| 7 | tasks view | `r53LZ` | Task list (status chips, by day) |
| 8 | sort-filter-custom-active | `NXXBZ` | Sort & filter bottom sheet |
| 9 | custom-date-range | `MdtE3` | Calendar range picker |
| 10 | tasks-custom-filtered | `E9Ubm` | Tasks with an active filter |
| 11 | tasks-calendar-view | `IuVpy` | Calendar view of tasks |
| 12 | ai-analysis-tab | `GbsPP` | Analytics dashboard (overview) |
| 13 | mood-trend-detail | `KhrMi` | Mood over week/month/year |
| 14 | emotion-detail (anxious) | `F5QpjH` | Single-emotion deep dive |
| 15 | all-insights | `R5zi4` | List of AI insight cards |
| 16 | theme-detail (self-doubt) | `b0SR0` | Single-theme deep dive |
| 17 | habits-detail | `vNwHS` | Journaling habits/streaks |
| 18 | concern-tracker-full | `zDoOc` | Flagged entries tracker |
| 19 | recommendation-detail | `h8cMKN` | "For you" recommendation |
| 20 | ai-chat | `X5iiB` | Chat with AI about entries |

### Possible gaps / things missing in the design (to confirm with user)
- **No empty / first-use states** (empty journal, empty tasks, no insights yet) — needed before AI has any data.
- **No loading / processing state** for the PROCESS step (Gemini latency) beyond the "PROCESSING" badge.
- **No error states** (bad/missing API key, Gemini failure, rate limit, offline).
- **No real auth flow** despite "Sign out" — local profile only, or future accounts?
- **Insights / Patterns** appear in the drawer as separate destinations but map to the AI-Analysis sub-screens — confirm IA.
- **tasks-calendar-view** and **habits-detail** show a horizontally-overflowing date strip in the design (a layout artifact) — to be resolved in the build.
- **Reminders/notifications** ("Remind me tomorrow", "wind-down reminder") have no settings/permission screen.

---

## 6. Tech stack (as requested)
- **Build tool:** Vite
- **UI:** React
- **Server state / async:** **React Query** (TanStack Query) — used for *all* data access (local DB reads/writes and Gemini calls modeled as queries/mutations).
- **Persistence / backend:** **open question** — see [04-architecture-recommendation.md](04-architecture-recommendation.md).
