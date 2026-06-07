'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { addDays, startOfWeek, format } from 'date-fns';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Fab } from '@/components/layout/Fab';
import { TaskRow } from '@/components/tasks/TaskRow';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useTasks } from '@/lib/query/hooks';
import { dayKey, cn } from '@/lib/utils';

export default function TasksCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(() => new Date());
  const { data, isLoading } = useTasks();

  const weekStart = addDays(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    weekOffset * 7,
  );
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const selectedKey = dayKey(selected.toISOString());

  const tasksForDay = (data?.tasks ?? []).filter(
    (t) => dayKey(t.createdAt) === selectedKey,
  );

  return (
    <Screen
      header={
        <>
          <AppHeader
            right={
              <Link
                href="/tasks"
                aria-label="List view"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-high text-ink-secondary"
              >
                <List className="h-4 w-4" />
              </Link>
            }
          />
          <TabBar />
        </>
      }
      floating={<Fab label="Add task" href="/tasks" />}
    >
      <div className="px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="text-ink-secondary"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-display text-[15px] font-semibold">
            {format(weekStart, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="text-ink-secondary"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const key = dayKey(d.toISOString());
            const active = key === selectedKey;
            const count = (data?.tasks ?? []).filter(
              (t) => dayKey(t.createdAt) === key,
            ).length;
            return (
              <button
                key={key}
                onClick={() => setSelected(d)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl py-2 transition',
                  active ? 'bg-primary text-white' : 'bg-surface',
                )}
              >
                <span className="text-[10px] uppercase opacity-70">
                  {format(d, 'EEEEE')}
                </span>
                <span className="text-[15px] font-semibold">
                  {format(d, 'd')}
                </span>
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    count > 0
                      ? active
                        ? 'bg-white'
                        : 'bg-primary'
                      : 'bg-transparent',
                  )}
                />
              </button>
            );
          })}
        </div>

        <p className="mb-3 text-[13px] font-medium text-ink-muted">
          {format(selected, 'EEEE, MMMM d')}
        </p>

        {isLoading ? (
          <LoadingState />
        ) : tasksForDay.length === 0 ? (
          <EmptyState title="Nothing scheduled" description="No tasks for this day." />
        ) : (
          <div className="space-y-2.5">
            {tasksForDay.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
