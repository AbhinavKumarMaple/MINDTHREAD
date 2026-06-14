'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { MoodChart } from '@/components/analysis/charts';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useAnalytics } from '@/lib/query/hooks';
import { moodAccent } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { MoodPoint } from '@/lib/types';

type Range = 'week' | 'month' | 'year';
const WINDOW: Record<Range, number> = { week: 7, month: 31, year: 365 };
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface InsightChip {
  label: string;
  icon: typeof ArrowUp;
  color: string;
}

function computeChips(points: MoodPoint[]): InsightChip[] {
  if (points.length < 2) return [];
  const out: InsightChip[] = [];
  const half = Math.floor(points.length / 2);
  const avg = (arr: MoodPoint[]) =>
    arr.reduce((a, p) => a + p.moodScore, 0) / Math.max(1, arr.length);
  const diff = avg(points.slice(half)) - avg(points.slice(0, half));
  if (diff > 0.3)
    out.push({ label: 'Improving', icon: ArrowUp, color: '#34D399' });
  else if (diff < -0.3)
    out.push({ label: 'Declining', icon: ArrowDown, color: '#EF4444' });
  else out.push({ label: 'Steady', icon: Minus, color: '#9CA3AF' });

  const byDay = new Map<number, number[]>();
  for (const p of points) {
    const d = new Date(p.date).getDay();
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(p.moodScore);
  }
  let bestDay = -1;
  let bestAvg = -1;
  for (const [day, scores] of byDay) {
    const a = scores.reduce((x, y) => x + y, 0) / scores.length;
    if (a > bestAvg) {
      bestAvg = a;
      bestDay = day;
    }
  }
  if (bestDay >= 0)
    out.push({
      label: `Best: ${WEEKDAYS[bestDay]}s`,
      icon: CalendarDays,
      color: '#A78BFA',
    });

  const low = points.reduce((m, p) => (p.moodScore < m.moodScore ? p : m));
  out.push({
    label: `Dip: W${Math.min(5, Math.floor((new Date(low.date).getDate() - 1) / 7) + 1)}`,
    icon: AlertTriangle,
    color: '#F59E0B',
  });
  return out;
}

export default function MoodTrendPage() {
  const router = useRouter();
  const { data, isLoading } = useAnalytics();
  const [range, setRange] = useState<Range>('month');
  const all = useMemo(() => data?.summary.moodTrend ?? [], [data]);

  const points = useMemo(() => {
    const cutoff = Date.now() - WINDOW[range] * 86_400_000;
    return all.filter((p) => +new Date(p.date) >= cutoff);
  }, [all, range]);

  const recent = points.slice().reverse();
  const avg =
    points.length > 0
      ? Math.round(
          (points.reduce((a, p) => a + p.moodScore, 0) / points.length) * 10,
        ) / 10
      : null;
  const chips = useMemo(() => computeChips(points), [points]);

  return (
    <Screen
      header={
        <>
          <div className="flex items-center px-5 pb-6 pt-2">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-high text-ink-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="flex-1 pr-12 text-center font-display text-[24px] font-bold text-ink-primary">
              Mood Trend
            </h1>
          </div>
          <div className="flex border-b border-line/60">
            {(['week', 'month', 'year'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'relative flex-1 pb-3.5 text-center text-[18px] capitalize transition',
                  range === r
                    ? 'font-semibold text-ink-primary'
                    : 'text-ink-muted',
                )}
              >
                {r}
                {range === r && (
                  <span className="absolute inset-x-8 bottom-0 h-[3px] rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </>
      }
    >
      <div className="px-5 pb-10 pt-5">
        {isLoading ? (
          <LoadingState />
        ) : all.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No mood data yet"
            description="Process some entries to see your mood trend over time."
          />
        ) : (
          <>
            <div className="rounded-3xl border border-line bg-surface p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-[20px] font-bold text-ink-primary">
                  {range === 'week'
                    ? '7-Day Overview'
                    : range === 'month'
                      ? '30-Day Overview'
                      : 'Yearly Overview'}
                </p>
                <p className="text-[16px] text-ink-muted">
                  Avg {avg ?? '—'} / 10
                </p>
              </div>
              {points.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-muted">
                  No entries in this range.
                </p>
              ) : (
                <MoodChart data={points} weekLabels={range !== 'week'} />
              )}
              {chips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {chips.map((c) => (
                    <span
                      key={c.label}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[14px] font-medium"
                      style={{ borderColor: c.color, color: c.color }}
                    >
                      <c.icon className="h-4 w-4" />
                      {c.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="mb-3 mt-7 text-[12px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
              Entries this {range}
            </p>
            <div className="space-y-3.5">
              {recent.map((p) => {
                const color = moodAccent(p.moodScore);
                return (
                  <Link
                    key={p.entryId}
                    href={`/entry/${p.entryId}`}
                    className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-6"
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-[3px]"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[18px] font-medium text-ink-primary">
                        {p.title ?? 'Untitled'}
                      </p>
                      <p className="mt-0.5 text-[14px] text-ink-muted">
                        {new Date(p.date).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className="ml-3 shrink-0 rounded-lg px-2.5 py-1 text-[15px] font-bold"
                      style={{ backgroundColor: `${color}26`, color }}
                    >
                      {p.moodScore}/10
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
