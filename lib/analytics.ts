import type {
  Entry,
  AnalyticsSummary,
  MoodPoint,
  EmotionStat,
  ThemeStat,
} from './types';
import { dayKey } from './utils';

const DAY = 24 * 60 * 60 * 1000;

function processed(entries: Entry[]): Entry[] {
  return entries.filter((e) => e.status === 'processed');
}

export function computeMoodTrend(entries: Entry[]): MoodPoint[] {
  return processed(entries)
    .filter((e) => e.moodScore != null)
    .map((e) => ({
      date: e.createdAt,
      entryId: e.id,
      title: e.title,
      moodScore: e.moodScore as number,
    }))
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

export function computeStreak(entries: Entry[]): number {
  const days = new Set(entries.map((e) => dayKey(e.createdAt)));
  if (days.size === 0) return 0;
  let cursor = new Date();
  // Allow the streak to count from today or yesterday.
  if (!days.has(dayKey(cursor.toISOString()))) {
    cursor = new Date(cursor.getTime() - DAY);
    if (!days.has(dayKey(cursor.toISOString()))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor.toISOString()))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY);
  }
  return streak;
}

export function computeEmotionStats(entries: Entry[]): EmotionStat[] {
  const now = Date.now();
  const recent = processed(entries).filter(
    (e) => now - +new Date(e.createdAt) <= 30 * DAY,
  );
  const prev = processed(entries).filter((e) => {
    const age = now - +new Date(e.createdAt);
    return age > 30 * DAY && age <= 60 * DAY;
  });
  const counts = new Map<string, number>();
  for (const e of processed(entries)) {
    for (const em of e.emotions) counts.set(em, (counts.get(em) ?? 0) + 1);
  }
  const pct = (list: Entry[], emotion: string) =>
    list.length === 0
      ? 0
      : Math.round(
          (list.filter((e) => e.emotions.includes(emotion)).length /
            list.length) *
            100,
        );
  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      count,
      thisPeriodPct: pct(recent, name),
      prevPeriodPct: pct(prev, name),
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeThemeStats(entries: Entry[]): ThemeStat[] {
  const map = new Map<string, string[]>();
  for (const e of processed(entries)) {
    for (const t of e.themes) {
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(e.id);
    }
  }
  return Array.from(map.entries())
    .map(([name, entryIds]) => ({ name, count: entryIds.length, entryIds }))
    .sort((a, b) => b.count - a.count);
}

export function computeSummary(entries: Entry[]): AnalyticsSummary {
  const proc = processed(entries);
  const moods = proc
    .map((e) => e.moodScore)
    .filter((m): m is number => m != null);
  const avgMood =
    moods.length > 0
      ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10
      : null;
  return {
    totalEntries: entries.length,
    processedEntries: proc.length,
    streakDays: computeStreak(entries),
    avgMood,
    moodTrend: computeMoodTrend(entries),
    topEmotions: computeEmotionStats(entries).slice(0, 6),
    topThemes: computeThemeStats(entries).slice(0, 8),
    concernCount: entries.filter(
      (e) => e.isConcern && e.concernStatus !== 'resolved',
    ).length,
    totalWords: entries.reduce((a, e) => a + e.wordCount, 0),
  };
}

export interface HabitStats {
  streakDays: number;
  totalEntries: number;
  totalWords: number;
  writingHours: number[]; // 24 buckets
  peakHourLabel: string;
  consistency: { day: string; count: number }[];
  lengthTrend: { entryNumber: number; words: number }[];
}

export function computeHabits(entries: Entry[]): HabitStats {
  const writingHours = new Array(24).fill(0);
  for (const e of entries) writingHours[new Date(e.createdAt).getHours()] += 1;
  const peakHour = writingHours.indexOf(Math.max(...writingHours));
  const fmtHour = (h: number) => {
    const ampm = h < 12 ? 'AM' : 'PM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour} ${ampm}`;
  };
  const consistencyMap = new Map<string, number>();
  for (const e of entries) {
    const k = dayKey(e.createdAt);
    consistencyMap.set(k, (consistencyMap.get(k) ?? 0) + 1);
  }
  return {
    streakDays: computeStreak(entries),
    totalEntries: entries.length,
    totalWords: entries.reduce((a, e) => a + e.wordCount, 0),
    writingHours,
    peakHourLabel:
      entries.length > 0
        ? `${fmtHour(peakHour)} – ${fmtHour((peakHour + 2) % 24)}`
        : '—',
    consistency: Array.from(consistencyMap.entries()).map(([day, count]) => ({
      day,
      count,
    })),
    lengthTrend: entries
      .slice()
      .sort((a, b) => a.entryNumber - b.entryNumber)
      .slice(-12)
      .map((e) => ({ entryNumber: e.entryNumber, words: e.wordCount })),
  };
}

export interface EmotionDetail {
  name: string;
  count: number;
  thisPeriodPct: number;
  prevPeriodPct: number;
  triggers: { theme: string; count: number }[];
  relatedEntries: { id: string; title: string | null; createdAt: string }[];
}

export function computeEmotionDetail(
  entries: Entry[],
  name: string,
): EmotionDetail {
  const stats = computeEmotionStats(entries).find((s) => s.name === name) ?? {
    name,
    count: 0,
    thisPeriodPct: 0,
    prevPeriodPct: 0,
  };
  const withEmotion = processed(entries).filter((e) =>
    e.emotions.includes(name),
  );
  const triggerCounts = new Map<string, number>();
  for (const e of withEmotion)
    for (const t of e.themes)
      triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1);
  return {
    ...stats,
    triggers: Array.from(triggerCounts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
    relatedEntries: withEmotion
      .slice()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .map((e) => ({ id: e.id, title: e.title, createdAt: e.createdAt })),
  };
}

export interface ThemeDetail {
  name: string;
  count: number;
  relatedThemes: string[];
  entries: {
    id: string;
    title: string | null;
    createdAt: string;
    summary: string | null;
  }[];
}

export function computeThemeDetail(entries: Entry[], name: string): ThemeDetail {
  const withTheme = processed(entries).filter((e) => e.themes.includes(name));
  const related = new Map<string, number>();
  for (const e of withTheme)
    for (const t of e.themes)
      if (t !== name) related.set(t, (related.get(t) ?? 0) + 1);
  return {
    name,
    count: withTheme.length,
    relatedThemes: Array.from(related.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 4),
    entries: withTheme
      .slice()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .map((e) => ({
        id: e.id,
        title: e.title,
        createdAt: e.createdAt,
        summary: e.summary,
      })),
  };
}
