# MINDTHREAD — Screen Specifications

> Per-screen spec reverse-engineered from `untitled.pen`. Sample data shown in the design (entry titles, dates, "Arjun", etc.) is **illustrative** — treat it as placeholder seed data. See [03-data-model.md](03-data-model.md) for entities and [01-overview.md](01-overview.md) for the design system.

Every screen shares a **status bar** (top) and **home indicator** (bottom).

---

## 1. setup-tone-selection (`v2upiL`) — Onboarding
**Purpose:** First-run; let the user choose how the AI talks to them.

- Centered **MINDTHREAD** wordmark + tagline *"your second mind."*
- Prompt: *"How should your AI respond to you? Choose a tone."*
- 2×2 grid of **tone cards**:
  - **Blunt & Direct** — "No sugar coating. Just facts."
  - **Warm & Gentle** — "Empathetic and easy to..."
  - **Analytical** — "Logic-driven insights."
  - **Close Friend** — "Conversational and casual."

**State:** one tone selected (highlighted). **Action:** selecting a tone persists `profile.tone` and proceeds to HOMESCREEN. **Build note:** the chosen tone becomes part of the Gemini system prompt for every AI call.

---

## 2. HOMESCREEN / Notes tab (`QfXa6`) — Journal list
**Purpose:** Default screen; browse journal entries.

- **Header:** hamburger icon · **MINDTHREAD** wordmark + tagline · **tone chip** ("⟡ Warm" with a "Change" link).
- **Tab bar:** **Notes** (active) · Tasks · AI Analysis.
- **Filter row:** month dropdown ("JUNE 2025 ▾") · "WEEK 1" · an **"+ AI"** pill (orange).
- **Entry list**, grouped by day header (e.g., "Tuesday · June 3"):
  - Each **entry card**: title (e.g., *"The Weight of Unfinished Things"*), date · time · "Entry #6", **emotion tags** (e.g., Anxious, Reflective), **status badge** (`PROCESSED` / `PROCESSING`).
- **Floating actions (bottom-right stack):** **FAB (+)** new entry · **filter/sort** button (blue) · **Ask-AI** button (orange).

**States:** entry `PROCESSED` vs `PROCESSING` (badge); empty state (missing in design — add one). **Interactions:** tap entry → editor (draft if unprocessed, processed view if processed); FAB → new `editor-draft`; tabs switch; filter button → sort/filter sheet; Ask-AI → ai-chat.

---

## 3. editor-draft (`kdYE3`) — Write / brain dump
**Purpose:** Capture raw thought; trigger AI processing.

- **Header:** back · date ("Thursday, June 5") + time · **PROCESS** button (primary).
- Sub-header: "Entry #6" · tone chip ("Warm · change").
- **AI nudge banner** (contextual): e.g. *"Late night entry detected. Sleep timing may be connected to emotional state."* with a CTA *"SET WIND-DOWN REMINDER"* and a dismiss ✕.
- **"YOUR DUMP"** section: large freeform multi-line text area. Placeholder vibe: *"while lonely, new bit-per thought, no rules."* Example content is a list of raw lines:
  - "can't sleep again"
  - "been thinking about the conversation with arjun"
  - "feel like I said something wrong"
  - "work presentation is tomorrow and I haven't started"

**States:** empty draft · typing · ready-to-process · **processing** (Gemini in flight — design needs a spinner/disabled state) · error (bad key / failure — missing). **Action:** **PROCESS** → call Gemini → create/update structured entry → navigate to editor-processed.

---

## 4. editor-processed (`GkQjA`) — AI-structured entry
**Purpose:** Show the AI's structured interpretation of the dump.

- **Header:** back · status ("Thursday, June 5") · **PROCESSED** badge.
- **AI title:** *"The Weight of Unfinished Conversations"* (LLM-generated).
- **Mood / emotion visualization:** horizontal bars (mood/emotion intensities), colored.
- Sections (collapsible-feeling cards):
  - **SUMMARY** — AI paragraph.
  - A reflective AI **question/prompt** ("…explain… will feel walking in?") with an **EXPLORE THIS** affordance.
  - **THEMES** — tagged.
  - A **task card** — e.g. *"Avoidant Rumination"* with a **MARK AS TASK** button (extracts a to-do).
  - Additional AI annotations (rumination pattern, etc.).
- **Ask-AI** floating button.

**Interactions:** MARK AS TASK → creates a Task linked to this entry; EXPLORE THIS / Ask-AI → ai-chat seeded with this entry; tap theme → theme-detail; re-process possible.

---

## 5. settings (`S2scK`)
**Purpose:** Configure AI tone, API key; about.

- Header: **SETTINGS**.
- **TONE** selector: Blunt & Direct · Analytical · **Warm & Gentle** (active) · Close Friend.
- **GEMINI API KEY** card: helper text *"Your data is stored locally. An API key is required for AI processing features."* · masked input · **SHOW** / **SAVE** buttons.
- **ABOUT MINDTHREAD:** *"MindThread is your second mind. A sanctuary for raw thought, refined by artificial intelligence to uncover patterns and promote clarity."*

**Build note:** This screen is the architecture anchor — **local storage + user-provided Gemini key**. Add: key validation/test, clear-data, export, theme, reminders settings (currently missing).

---

## 6. hamburger-menu-overlay (`S66am`) — Drawer
**Purpose:** Global navigation.

- Slide-in **drawer** (left, ~310px) over a dimmed backdrop (`#000000CC`), close ✕.
- Profile header: avatar · **"Hey, Journal"** · "mindthread user".
- Nav items: **Journal** (active, ›) · Tasks · Insights · Patterns · Settings.
- **Sign out** (red) at the bottom.

**Note:** "Insights" and "Patterns" map onto AI-Analysis sub-screens; "Sign out" implies optional accounts (not part of the local-first MVP unless a backend is added).

---

## 7. tasks view (`r53LZ`) — Tasks tab
**Purpose:** Manage to-dos, mostly auto-extracted from entries.

- Header + **Tasks** tab active.
- Month dropdown · "Day 1".
- **Status filter chips:** `12 ALL` · `5 DONE` · `7 PENDING` · `1 CONCERN`.
- Tasks grouped by day:
  - "Follow up with Arjun about the conversation" — Entry #6
  - "Prepare slides for tomorrow's presentation" — **high priority** — Entry #6
  - "Reply to the team Slack thread" — **done** — Entry #6
  - "Go for a morning walk" — done — Entry #5
  - "Look into that freelance opportunity" — Entry #5
  - footer "2 items completed"
- Each **task row:** checkbox (done state = green check), title, priority/source chips, **Entry # link** back to source entry.
- **FAB (+)** add task · **filter/sort** button.

**Interactions:** toggle done; tap "Entry #" → source entry; filter chip → filter; FAB → add manual task; filter button → sort/filter sheet.

---

## 8. sort-filter-custom-active (`NXXBZ`) — Sort & Filter sheet
**Purpose:** Filter/sort entries or tasks.

- Header: back · **Sort & Filter** · **RESET**.
- **Sort By:** Newest First (active) · Oldest First · By Priority · By Status.
- **Date Range:** Today · This Week · This Month · **Custom** (active).
- **Source:** All Sources (active) · From Entry · Manual Add.
- **Apply Filters** primary button.

**Interaction:** selecting **Custom** opens custom-date-range; Apply returns to the filtered list.

---

## 9. custom-date-range (`MdtE3`) — Date range picker
- Header: back · **Custom Date Range** · **Done**.
- **From** / **To** date fields (with calendar icons): "June 1, 2025" → "June 14, 2025".
- **Month calendar** (June 2025) with a selected **range** (1…14 highlighted; endpoints emphasized).
- **Quick Select:** Last 7 days (active) · Last 30 days · Last 3 months.
- **Apply Range** primary button.

---

## 10. tasks-custom-filtered (`E9Ubm`) — Filtered tasks
**Purpose:** Tasks list with an active custom filter applied.

- **Active Filter** chip: "Jun 1 – Jun 14" (with clear).
- Status chips: `7 TASKS` · `3 DONE` · `4 PENDING`.
- Tasks (mix of entry-sourced and other sources):
  - "Analyze monthly reflection trends" — Notebook #8
  - "Draft script for community meetup" — Entry #12
  - "Review AI summary accuracy" — done
  - "Update design system tokens" — done — Entry #9
- FAB + filter button.

---

## 11. tasks-calendar-view (`IuVpy`) — Calendar view
**Purpose:** Tasks plotted on a calendar/date strip.

- Header + tabs; a **calendar/date strip** (month + day numbers) at top.
- Tasks for the selected day listed below, with source chips.
- **FAB (+)**.

**Known design artifact:** the horizontal date strip overflows the frame — fix to a scrollable/wrapping week strip in the build.

---

## 12. ai-analysis-tab (`GbsPP`) — Analytics dashboard
**Purpose:** Overview of all AI-derived analytics (the "AI Analysis" tab).

- Header + **AI Analysis** tab active; sub-tabs (Mood / Emotions / Themes / …).
- **Top stat row:** metrics (e.g., total entries, streak, avg mood).
- **Mood line chart:** "30-Day Overview".
- **Emotion bars:** top emotions with intensities.
- **Insight quote card:** a highlighted AI insight.
- **Recommendation cards** ("For you").
- Floating filter button.

**Interactions:** tap mood chart → mood-trend-detail; tap an emotion → emotion-detail; tap a theme → theme-detail; insight card → all-insights; recommendation → recommendation-detail.

---

## 13. mood-trend-detail (`KhrMi`)
- Header: back · **Mood Trend**.
- Range tabs: Week · **Month** · Year.
- **"30-Day Overview"** line chart, average badge ("6.0 / 10").
- Insight chips: "↑ Improving" · "Best: Thursdays" · "⚠ Dip: W2".
- **"ENTRIES THIS MONTH"** list — each entry with its **mood score**:
  - "Morning breakthrough" — June 12 — 9/10
  - "Late night doubts" — June 6 — 4/10
  - "Reflection on growth" — June 18 — 7/10

---

## 14. emotion-detail (anxious) (`F5QpjH`)
**Purpose:** Deep dive on a single emotion.

- Header: back · **Anxious**.
- Big stat: **75%** "of this month's entries" · This week 75% · Last month 45%.
- **TRIGGERED BY:** Work deadlines · Late nights · Social pressure (ranked bars).
- **RELATED ENTRIES:** "Upcoming deadline stress" · "Post-monthly reflection" · "Late night scroll" — "View all 10 entries".

---

## 15. all-insights (`R5zi4`)
**Purpose:** Feed of AI-generated insights.

- Header: **AI Insights** · filter chips (All / …).
- Scrollable list of **insight cards**, each an AI quote + attribution *"Based on N entries"*. E.g. *"Your most reflective entries happen late at night — consider exploring what's keeping you up."*

---

## 16. theme-detail (self-doubt) (`b0SR0`)
**Purpose:** Deep dive on a recurring theme.

- Header: back · **Self-doubt**.
- **"6 entries mention this theme"** + sparkline.
- **AI Analysis:** *"Self-doubt peaks around work deadlines. Your entries show a pattern of second-guessing decisions under pressure."*
- **Related Themes:** Work stress · Anxiety · Growth.
- **Mentioned across** — entries with date + quote:
  - "Project presentation slides" — June 3 — "Still feeling unsure about the final design…"
  - "Meeting with management" — June 2
  - "Reviewing the draft" — May 30
  - "Team feedback" — May 25
- **"Ask AI about this →"** button → ai-chat seeded with the theme.

---

## 17. habits-detail (`vNwHS`)
**Purpose:** Journaling behavior analytics.

- Header: back · **Journaling Habits**.
- Stat row: **14** (day streak) · **6** · **320** (e.g., total words/entries).
- **Writing Time** heatmap — peak **"11 PM – 1 AM"**.
- **Consistency Calendar** (June 2025) — day dots by activity.
- **Entry Length Trend** — bar chart.
- **Streaks & value moments**.

**Known design artifact:** consistency calendar overflows horizontally — fix in build.

---

## 18. concern-tracker-full (`zDoOc`)
**Purpose:** Track entries the AI flagged as concerning (mental-health watch).

- Header: **Concern Tracker** · status pill.
- **"3 flagged entries"** out of 44 total (~7%) · **↑ Improving**.
- Filter: **All** · Unresolved · Resolved.
- Flagged entries (each with quote, date, status, resolve action):
  - "Project presentation slides" — Unresolved — *"Feeling overwhelmed by the sheer amount of detail…"*
  - "Conversation with Arjun" — Improving
  - "Late night reflections" — Unresolved
- **"Export concern report"** button.

**Sensitivity note:** this is the most safety-relevant surface — see privacy notes in the architecture doc.

---

## 19. recommendation-detail (`h8cMKN`)
**Purpose:** A single actionable "For You" recommendation.

- Header: **FOR YOU** · "A RECOMMENDATION".
- Title: **"Try journaling in the morning"** + rationale *"Your evening entries show higher anxiety patterns. Morning journaling can help set a calmer tone for the day."* · *"Based on 14 entries analyzed."*
- **WHY THIS WORKS:** Reduces anxiety · Sets daily intention · Better emotional clarity.
- **TRY IT NOW** — a seed prompt: *"What's one thing you're looking forward to today, and what might hold you back?"*
- Buttons: **Start Writing** (→ editor-draft seeded with the prompt) · **Remind me tomorrow**.

---

## 20. ai-chat (`X5iiB`)
**Purpose:** Conversational AI grounded in the user's journal (RAG).

- Header: back · **MindThread AI** · "your journaling sidekick" · new-chat (+).
- **Chat transcript** (AI left bubbles, user right purple bubbles). Example:
  - AI: *"Hi! I've analyzed your June entries. Your mood peaks on Thursdays — want to explore why?"*
  - User: *"Yes, what patterns do you see?"*
  - AI: *"You tend to write longer, more reflective entries on Thursdays. Words like 'growth' and 'clarity' appear 3x more often. You also mention Arjun's conversations passively."*
  - User: *"That's interesting. What about my anxiety?"*
  - AI: *"Anxiety spikes appear in entries after 11PM, especially on work nights. Your W2 dip (mood 4.2) aligned with 3 late entries mentioning deadlines."*
- **Suggestion chips:** "Tell me more" · "What should I do?" · "Show patterns".
- **Input:** "Ask your AI coach…" + send.

**Build note:** the AI must be given the user's relevant entries as context (retrieval). For a local-first app this means selecting/summarizing entries client-side and passing them into the Gemini prompt.
