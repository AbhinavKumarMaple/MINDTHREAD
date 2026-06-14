'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Menu,
  SlidersHorizontal,
} from 'lucide-react';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  getDay,
} from 'date-fns';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Fab } from '@/components/layout/Fab';
import { TaskRow } from '@/components/tasks/TaskRow';
import { TaskSheet } from '@/components/tasks/TaskSheet';
import { StatusSheet } from '@/components/tasks/StatusSheet';
import { SortFilterScreen } from '@/components/filters/SortFilterScreen';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useTasks } from '@/lib/query/hooks';
import { dayKey, formatDayLabel, taskDate, cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

type StatusFilter = 'all' | 'pending' | 'done' | 'concern';
type SortKey = 'newest' | 'oldest' | 'priority' | 'status';
type SourceKey = 'all' | 'entry' | 'manual';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function dotColor(t: Task): string {
  if (t.status === 'cancelled') return '#6B7280';
  if (t.status === 'done') return '#34D399';
  if (t.isConcern) return '#3B82F6';
  return '#F59E0B';
}

export default function TasksCalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [source, setSource] = useState<SourceKey>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);

  const params = useMemo(() => {
    const base: Record<string, string | undefined> = { status, sort };
    if (source !== 'all') base.source = source;
    return base;
  }, [status, sort, source]);

  const { data, isLoading } = useTasks(params);
  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const counts = data?.counts;

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const k = dayKey(taskDate(t));
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return map;
  }, [tasks]);

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
  const lead = (getDay(startOfMonth(month)) + 6) % 7;
  const selectedKey = dayKey(selected.toISOString());
  const dayTasks = byDay.get(selectedKey) ?? [];

  return (
    <Screen
      header={
        <>
          <AppHeader
            right={
              <div className="flex items-center gap-3">
                <Link
                  href="/tasks"
                  aria-label="List view"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink-secondary transition active:scale-95"
                >
                  <Menu className="h-5 w-5" strokeWidth={2.5} />
                </Link>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-bg-deep">
                  <CalendarDays className="h-5 w-5" strokeWidth={2} />
                </span>
              </div>
            }
          />
          <TabBar />
        </>
      }
      floating={
        <>
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label="Sort & filter"
            className="absolute bottom-[88px] right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-action text-white shadow-card active:scale-95"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <Fab label="Add task" onClick={() => setAddOpen(true)} />
        </>
      }
    >
      <div className="px-5 py-3">
        <div className="flex gap-2.5">
          <span className="rounded-md bg-primary/20 px-2.5 py-1 text-[12px] font-bold text-primary-soft">
            {counts?.all ?? 0} ALL
          </span>
          <span className="rounded-md bg-success/15 px-2.5 py-1 text-[12px] font-bold text-success">
            {counts?.done ?? 0} DONE
          </span>
          <span className="rounded-md bg-ai/15 px-2.5 py-1 text-[12px] font-bold text-ai">
            {counts?.pending ?? 0} PENDING
          </span>
        </div>

        <div className="mt-4 rounded-3xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between pb-4">
            <span className="font-display text-[20px] font-bold text-ink-primary">
              {format(month, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMonth(addMonths(month, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-ink-secondary" />
              </button>
              <button
                onClick={() => setMonth(addMonths(month, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-ink-secondary" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 pb-2 text-center text-[13px] font-semibold text-ink-muted">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: lead }).map((_, i) => (
              <span key={`lead-${i}`} />
            ))}
            {days.map((d) => {
              const k = dayKey(d.toISOString());
              const dayList = byDay.get(k) ?? [];
              const active = isSameDay(d, selected);
              return (
                <button
                  key={k}
                  onClick={() => setSelected(d)}
                  className="flex flex-col items-center gap-1 py-1"
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-[15px] transition',
                      active
                        ? 'bg-primary font-bold text-white'
                        : 'text-ink-secondary hover:bg-surface-high',
                    )}
                  >
                    {format(d, 'd')}
                  </span>
                  <span className="flex h-1.5 items-center gap-0.5">
                    {dayList.slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: dotColor(t) }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-[16px] text-ink-muted">
            {formatDayLabel(selected.toISOString())}
          </p>
          <span className="rounded-md bg-primary/20 px-2.5 py-1 text-[12px] font-bold uppercase text-primary-soft">
            {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <LoadingState />
          ) : dayTasks.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              description="No tasks for this day."
            />
          ) : (
            <div className="space-y-3.5">
              {dayTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onOpen={setEditTask}
                  onStatus={setStatusTask}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-5 text-[13px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ai" /> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-action" /> From concern
          </span>
        </div>
      </div>

      <SortFilterScreen
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onReset={() => {
          setSort('newest');
          setSource('all');
          setStatus('all');
        }}
        sections={[
          {
            label: 'Sort By',
            value: sort,
            onChange: (v) => setSort(v as SortKey),
            options: [
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'priority', label: 'By Priority' },
              { value: 'status', label: 'By Status' },
            ],
          },
          {
            label: 'Status',
            value: status,
            onChange: (v) => setStatus(v as StatusFilter),
            options: [
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'done', label: 'Done' },
              { value: 'concern', label: 'From Concern' },
            ],
          },
          {
            label: 'Source',
            value: source,
            onChange: (v) => setSource(v as SourceKey),
            options: [
              { value: 'all', label: 'All Sources' },
              { value: 'entry', label: 'From Entry' },
              { value: 'manual', label: 'Manual Add' },
            ],
          },
        ]}
      />

      <TaskSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultDate={selected}
      />
      <TaskSheet
        open={!!editTask}
        onClose={() => setEditTask(null)}
        task={editTask}
      />
      <StatusSheet
        open={!!statusTask}
        onClose={() => setStatusTask(null)}
        task={statusTask}
      />
    </Screen>
  );
}
