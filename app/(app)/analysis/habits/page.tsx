'use client';

import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, SectionLabel } from '@/components/ui/Card';
import { StatCard, MiniBars } from '@/components/analysis/charts';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useHabits } from '@/lib/query/hooks';
import { Clock } from 'lucide-react';

export default function HabitsPage() {
  const { data, isLoading } = useHabits();
  const habits = data?.habits;

  return (
    <Screen header={<ScreenHeader title="Journaling Habits" />}>
      <div className="space-y-5 px-5 pb-10">
        {isLoading ? (
          <LoadingState />
        ) : !habits || habits.totalEntries === 0 ? (
          <EmptyState
            icon={Clock}
            title="No habits yet"
            description="Write a few entries to see your journaling patterns and streaks."
          />
        ) : (
          <>
            <div className="flex gap-2.5">
              <StatCard value={`${habits.streakDays}`} label="Day streak" />
              <StatCard value={habits.totalEntries} label="Entries" />
              <StatCard
                value={
                  habits.totalWords > 999
                    ? `${(habits.totalWords / 1000).toFixed(1)}k`
                    : habits.totalWords
                }
                label="Words"
              />
            </div>

            <Card>
              <div className="mb-2 flex items-center justify-between">
                <SectionLabel className="mb-0">Writing time</SectionLabel>
                <span className="rounded-full bg-surface-high px-2.5 py-1 text-xs text-primary-soft">
                  peak {habits.peakHourLabel}
                </span>
              </div>
              <MiniBars data={habits.writingHours} height={70} />
              <div className="mt-1.5 flex justify-between text-[9px] text-ink-muted">
                <span>12a</span>
                <span>6a</span>
                <span>12p</span>
                <span>6p</span>
                <span>11p</span>
              </div>
            </Card>

            <Card>
              <SectionLabel>Entry length trend</SectionLabel>
              <MiniBars
                data={habits.lengthTrend.map((l) => l.words)}
                color="#F49E12"
                height={80}
              />
              <p className="mt-2 text-xs text-ink-muted">
                Words per entry over your last {habits.lengthTrend.length}{' '}
                entries
              </p>
            </Card>

            <Card>
              <SectionLabel>Consistency</SectionLabel>
              <p className="text-sm text-ink-secondary">
                You've journaled on{' '}
                <span className="font-semibold text-ink-primary">
                  {habits.consistency.length}
                </span>{' '}
                different days. Keep your{' '}
                <span className="font-semibold text-primary-soft">
                  {habits.streakDays}-day streak
                </span>{' '}
                going.
              </p>
            </Card>
          </>
        )}
      </div>
    </Screen>
  );
}
