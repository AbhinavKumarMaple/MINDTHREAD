'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Sparkles,
  SlidersHorizontal,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { ToneChip } from '@/components/layout/ToneChip';
import { MoodChart } from '@/components/analysis/charts';
import { ErrorState, EmptyState } from '@/components/ui/states';
import { AnalysisSkeleton } from '@/components/ui/skeletons';
import {
  useAnalytics,
  useHabits,
  useConcerns,
  useInsights,
  useMe,
} from '@/lib/query/hooks';
import { emotionColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

const THEME_COLORS = [
  '#F59E0B',
  '#34D399',
  '#EF4444',
  '#EC4899',
  '#3B82F6',
  '#2DD4BF',
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-8 text-[12px] font-bold uppercase tracking-[0.2em] text-ink-secondary first:mt-0">
      {children}
    </p>
  );
}

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function AnalysisPage() {
  const me = useMe();
  const { data, isLoading, isError, refetch } = useAnalytics();
  const habits = useHabits();
  const concerns = useConcerns();
  const insights = useInsights();
  const summary = data?.summary;
  const tone = me.data?.user?.tone ?? 'warm';

  const monthLabel = new Date().toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  // Weekday activity intensity (Mon..Sun) from the consistency calendar.
  const weekdayHeat = useMemo(() => {
    const buckets = new Array(7).fill(0);
    for (const c of habits.data?.habits.consistency ?? []) {
      const wd = (new Date(c.day).getDay() + 6) % 7;
      buckets[wd] += c.count;
    }
    const max = Math.max(1, ...buckets);
    return buckets.map((b) => b / max);
  }, [habits.data]);

  const firstInsight = insights.data?.insights[0];
  const topEmotions = summary?.topEmotions.slice(0, 5) ?? [];
  const maxPct = Math.max(1, ...topEmotions.map((e) => e.thisPeriodPct));
  const flagged = (concerns.data?.entries ?? []).slice(0, 3);

  const recoCards = useMemo(() => {
    const cards: { icon: typeof Lightbulb; accent: string; title: string; body: string }[] = [];
    const hours = habits.data?.habits.writingHours ?? [];
    const peak = hours.length ? hours.indexOf(Math.max(...hours)) : null;
    if (peak != null && (peak >= 21 || peak <= 4)) {
      cards.push({
        icon: Lightbulb,
        accent: '#8B5CF6',
        title: 'Try journaling in the morning',
        body: 'Your evening entries show more anxiety patterns.',
      });
    } else {
      cards.push({
        icon: Lightbulb,
        accent: '#8B5CF6',
        title: 'Keep your reflection streak alive',
        body: 'A short, honest check-in today keeps the thread going.',
      });
    }
    const best = (summary?.moodTrend ?? []).reduce(
      (m, p) => (m == null || p.moodScore > m.moodScore ? p : m),
      null as null | { date: string; moodScore: number },
    );
    if (best) {
      cards.push({
        icon: BookOpen,
        accent: '#34D399',
        title: "Review last week's entries",
        body: `You had a breakthrough on ${new Date(best.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} worth revisiting.`,
      });
    }
    return cards;
  }, [habits.data, summary]);

  return (
    <Screen
      header={
        <>
          <AppHeader right={<ToneChip tone={tone} />} />
          <TabBar />
        </>
      }
      floating={
        <Link
          href="/analysis/insights"
          aria-label="AI Insights"
          className="absolute bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-action text-white shadow-card active:scale-95"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Link>
      }
    >
      <div className="px-5 py-4 pb-24">
        {isLoading ? (
          <AnalysisSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !summary || summary.processedEntries === 0 ? (
          <EmptyState
            icon={Activity}
            title="No analysis yet"
            description="Process a few journal entries and your mood trends, emotions, themes and insights will appear here."
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  [summary.totalEntries, 'Entries', '#8B5CF6'],
                  [summary.avgMood ?? '—', 'Mood Score', '#34D399'],
                  [summary.streakDays, 'Day Streak', '#F59E0B'],
                ] as [React.ReactNode, string, string][]
              ).map(([value, label, dot]) => (
                <div
                  key={label}
                  className="relative rounded-2xl border border-line bg-surface p-4"
                >
                  <span
                    className="absolute right-3 top-3 h-2 w-2 rounded-full"
                    style={{ backgroundColor: dot }}
                  />
                  <p className="font-display text-[26px] font-bold text-ink-primary">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{label}</p>
                </div>
              ))}
            </div>

            <SectionLabel>Mood Trend</SectionLabel>
            <Link
              href="/analysis/mood"
              className="block rounded-2xl border border-line bg-surface p-5"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[16px] font-semibold text-ink-primary">
                  30-Day Overview
                </p>
                <p className="text-[13px] text-ink-muted">{monthLabel}</p>
              </div>
              <MoodChart data={summary.moodTrend} weekLabels />
            </Link>

            <SectionLabel>Top Emotions</SectionLabel>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-4 text-[16px] font-semibold text-ink-primary">
                This Month
              </p>
              <div className="space-y-4">
                {topEmotions.map((e) => (
                  <Link
                    key={e.name}
                    href={`/analysis/emotion/${encodeURIComponent(e.name)}`}
                    className="block"
                  >
                    <div className="mb-1.5 flex items-center justify-between text-[15px]">
                      <span className="capitalize text-ink-secondary">
                        {e.name}
                      </span>
                      <span className="text-ink-muted">{e.thisPeriodPct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-high">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(6, (e.thisPeriodPct / maxPct) * 100)}%`,
                          backgroundColor: emotionColor(e.name),
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/analysis/insights"
              className="relative mt-6 block overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6"
            >
              <span className="absolute inset-y-0 left-0 w-[3px] bg-primary-soft" />
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.15em] text-primary-soft">
                <Sparkles className="h-3.5 w-3.5" fill="currentColor" /> AI
                Insight
              </p>
              <p className="mt-3 font-display text-[19px] font-medium italic leading-relaxed text-ink-primary">
                “
                {firstInsight?.text ??
                  'Generate AI insights to surface patterns across your entries.'}
                ”
              </p>
              <p className="mt-3 text-right text-[13px] text-ink-muted">
                — Based on {firstInsight?.basedOn ?? summary.processedEntries}{' '}
                entries
              </p>
            </Link>

            <SectionLabel>Key Themes</SectionLabel>
            <div className="flex flex-wrap gap-2.5">
              {summary.topThemes.map((t, i) => {
                const color = THEME_COLORS[i % THEME_COLORS.length];
                return (
                  <Link
                    key={t.name}
                    href={`/analysis/theme/${encodeURIComponent(t.name)}`}
                    className="rounded-full border px-4 py-1.5 text-[14px] font-medium capitalize"
                    style={{ borderColor: color, color }}
                  >
                    {t.name.replace(/-/g, ' ')}
                  </Link>
                );
              })}
            </div>

            <SectionLabel>Journaling Habits</SectionLabel>
            <Link
              href="/analysis/habits"
              className="block rounded-2xl border border-line bg-surface p-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] text-ink-muted">Most Active</p>
                  <p className="mt-1 font-display text-[19px] font-bold text-ink-primary">
                    {habits.data?.habits.peakHourLabel ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-ink-muted">Avg Length</p>
                  <p className="mt-1 font-display text-[19px] font-bold text-ink-primary">
                    {habits.data && habits.data.habits.totalEntries > 0
                      ? `${Math.round(habits.data.habits.totalWords / habits.data.habits.totalEntries)} words`
                      : '—'}
                  </p>
                </div>
              </div>
              <p className="mb-2 mt-4 text-[12px] text-ink-muted">
                Activity Heatmap
              </p>
              <div className="flex items-center justify-between px-1">
                {weekdayHeat.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span
                      className="h-5 w-5 rounded-full"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${0.15 + h * 0.85})`,
                      }}
                    />
                    <span className="text-[11px] text-ink-muted">
                      {WEEKDAY_LETTERS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </Link>

            <SectionLabel>Concern Tracker</SectionLabel>
            <Link
              href="/analysis/concerns"
              className="block rounded-2xl border border-line bg-surface p-5"
            >
              <p className="text-[15px] text-ink-secondary">
                <span className="mr-2 rounded-md bg-primary/20 px-2 py-0.5 text-[13px] font-bold text-primary-soft">
                  {concerns.data?.counts.total ?? 0} entries
                </span>
                flagged this month
              </p>
              <div className="mt-4 space-y-3">
                {flagged.map((e) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <span className="h-4 w-[3px] rounded-full bg-danger" />
                    <span className="flex-1 truncate text-[15px] text-ink-primary">
                      {e.title ?? 'Untitled'}
                    </span>
                    <span className="text-[13px] text-ink-muted">
                      {new Date(e.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
                {flagged.length === 0 && (
                  <p className="text-[14px] text-ink-muted">
                    Nothing flagged. Keep writing.
                  </p>
                )}
              </div>
            </Link>

            <SectionLabel>For You</SectionLabel>
            <div className="space-y-3.5">
              {recoCards.map((c) => (
                <Link
                  key={c.title}
                  href="/analysis/recommendation"
                  className="relative block overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: c.accent }}
                  />
                  <div className="flex items-start gap-3.5">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${c.accent}26`, color: c.accent }}
                    >
                      <c.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[16px] font-semibold text-ink-primary">
                        {c.title}
                      </p>
                      <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                        {c.body}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
