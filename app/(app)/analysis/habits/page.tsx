'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, ArrowUpRight, ArrowRight } from 'lucide-react';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from 'date-fns';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/ui/states';
import { DetailSkeleton } from '@/components/ui/skeletons';
import { useHabits } from '@/lib/query/hooks';
import { dayKey, cn } from '@/lib/utils';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-8 text-[13px] font-bold tracking-[0.05em] text-ink-secondary first:mt-0">
      {children}
    </p>
  );
}

export default function HabitsPage() {
  const router = useRouter();
  const { data, isLoading } = useHabits();
  const habits = data?.habits;
  const [month] = useState(() => startOfMonth(new Date()));

  const journaledDays = useMemo(
    () => new Set((habits?.consistency ?? []).map((c) => c.day)),
    [habits],
  );

  const monthDays = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const blockMax = Math.max(
    1,
    ...(habits?.weekdayBlocks.flat() ?? [0]),
  );
  const wordsMax = Math.max(1, ...(habits?.weekdayWords ?? [0]));

  return (
    <Screen
      header={
        <div className="flex items-center px-5 pb-5 pt-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="text-ink-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 pr-6 text-center font-display text-[22px] font-bold text-ink-primary">
            Journaling Habits
          </h1>
        </div>
      }
    >
      <div className="px-5 pb-12">
        {isLoading ? (
          <DetailSkeleton />
        ) : !habits || habits.totalEntries === 0 ? (
          <EmptyState
            icon={Clock}
            title="No habits yet"
            description="Write a few entries to see your journaling patterns and streaks."
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  [habits.totalEntries, 'Entries', '#8B5CF6'],
                  [habits.streakDays, 'Day Streak', '#F59E0B'],
                  [habits.avgWords, 'Avg Words', '#34D399'],
                ] as [number, string, string][]
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

            <SectionLabel>Writing Time</SectionLabel>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-[13px] text-ink-muted">Most Active Window</p>
              <p className="mt-1 font-display text-[24px] font-bold text-ink-primary">
                {habits.peakHourLabel}
              </p>
              <div className="mt-5 grid grid-cols-7 gap-y-3">
                {WEEKDAYS.map((d, i) => (
                  <span
                    key={`h-${i}`}
                    className="text-center text-[12px] font-semibold text-ink-muted"
                  >
                    {d}
                  </span>
                ))}
                {habits.weekdayBlocks.map((row, r) =>
                  row.map((v, c) => (
                    <span key={`${r}-${c}`} className="flex justify-center">
                      <span
                        className="h-5 w-5 rounded-full"
                        style={{
                          backgroundColor: `rgba(139, 92, 246, ${
                            0.12 + (v / blockMax) * 0.88
                          })`,
                        }}
                      />
                    </span>
                  )),
                )}
              </div>
            </div>

            <SectionLabel>Streak Calendar</SectionLabel>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-4 font-display text-[18px] font-bold text-ink-primary">
                {format(month, 'MMMM yyyy')}
              </p>
              <div className="grid grid-cols-7 gap-y-2.5">
                {monthDays.map((d) => {
                  const active = journaledDays.has(dayKey(d.toISOString()));
                  return (
                    <span key={d.toISOString()} className="flex justify-center">
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-[13px]',
                          active
                            ? 'bg-primary font-bold text-white'
                            : 'text-ink-muted',
                        )}
                      >
                        {format(d, 'd')}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            <SectionLabel>Entry Length Trend</SectionLabel>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex h-32 items-end justify-between gap-3 px-1">
                {habits.weekdayWords.map((w, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full max-w-[26px] rounded-md bg-primary-soft"
                      style={{
                        height: `${Math.max(6, (w / wordsMax) * 100)}px`,
                      }}
                    />
                    <span className="text-[12px] font-semibold text-ink-muted">
                      {WEEKDAYS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <SectionLabel>Writing & Mood Correlation</SectionLabel>
            <div className="grid grid-cols-2 divide-x divide-line rounded-2xl border border-line bg-surface p-5">
              <div className="pr-4">
                <p className="text-[13px] text-ink-muted">Longer entries</p>
                <p className="mt-1.5 flex items-center gap-1 text-[16px] font-bold text-success">
                  <ArrowUpRight className="h-4 w-4" />
                  {habits.correlation.longer}
                </p>
              </div>
              <div className="pl-4">
                <p className="text-[13px] text-ink-muted">Short entries</p>
                <p className="mt-1.5 flex items-center gap-1 text-[16px] font-bold text-ai">
                  <ArrowRight className="h-4 w-4" />
                  {habits.correlation.shorter}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
