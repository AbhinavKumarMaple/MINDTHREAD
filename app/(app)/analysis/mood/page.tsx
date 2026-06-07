'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Star, ArrowDownRight } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, SectionLabel } from '@/components/ui/Card';
import { MoodChart } from '@/components/analysis/charts';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useAnalytics } from '@/lib/query/hooks';
import { formatDayLabel } from '@/lib/utils';
import type { MoodPoint } from '@/lib/types';

type Range = 'week' | 'month' | 'year';
const WINDOW: Record<Range, number> = { week: 7, month: 31, year: 365 };
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Insight {
  label: string;
  icon: typeof TrendingUp;
  className: string;
}

function computeInsights(points: MoodPoint[]): Insight[] {
  if (points.length < 2) return [];
  const out: Insight[] = [];
  const half = Math.floor(points.length / 2);
  const avg = (arr: MoodPoint[]) =>
    arr.reduce((a, p) => a + p.moodScore, 0) / Math.max(1, arr.length);
  const diff = avg(points.slice(half)) - avg(points.slice(0, half));
  if (diff > 0.3)
    out.push({ label: 'Improving', icon: TrendingUp, className: 'text-success' });
  else if (diff < -0.3)
    out.push({ label: 'Declining', icon: TrendingDown, className: 'text-danger' });
  else out.push({ label: 'Steady', icon: Minus, className: 'text-ink-secondary' });

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
      icon: Star,
      className: 'text-ai',
    });

  const low = points.reduce((m, p) => (p.moodScore < m.moodScore ? p : m));
  out.push({
    label: `Low: ${new Date(low.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    icon: ArrowDownRight,
    className: 'text-primary-soft',
  });
  return out;
}

export default function MoodTrendPage() {
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
  const insights = useMemo(() => computeInsights(points), [points]);

  return (
    <Screen header={<ScreenHeader title="Mood Trend" />}>
      <div className="space-y-5 px-5 pb-10">
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
            <SegmentedControl<Range>
              value={range}
              onChange={setRange}
              options={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
            />

            <Card>
              <div className="mb-2 flex items-center justify-between">
                <SectionLabel className="mb-0">
                  {range === 'week' ? '7-day' : range === 'month' ? '30-day' : 'Yearly'}{' '}
                  overview
                </SectionLabel>
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary-soft">
                  avg {avg ?? '—'} / 10
                </span>
              </div>
              {points.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-muted">
                  No entries in this range.
                </p>
              ) : (
                <MoodChart data={points} />
              )}
            </Card>

            {insights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {insights.map((ins) => (
                  <span
                    key={ins.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-high px-3 py-1.5 text-[13px] font-medium"
                  >
                    <ins.icon className={`h-3.5 w-3.5 ${ins.className}`} />
                    <span className="text-ink-secondary">{ins.label}</span>
                  </span>
                ))}
              </div>
            )}

            <div>
              <SectionLabel>Entries</SectionLabel>
              <div className="space-y-2.5">
                {recent.map((p) => (
                  <Link
                    key={p.entryId}
                    href={`/entry/${p.entryId}`}
                    className="flex items-center justify-between rounded-2xl border border-line bg-surface p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] text-ink-primary">
                        {p.title ?? 'Untitled'}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatDayLabel(p.date)}
                      </p>
                    </div>
                    <span className="ml-3 shrink-0 font-display text-lg font-bold text-primary-soft">
                      {p.moodScore}
                      <span className="text-sm text-ink-muted">/10</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
