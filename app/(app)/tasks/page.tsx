'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ListChecks,
  SlidersHorizontal,
  X,
  CalendarDays,
  Menu,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Fab } from '@/components/layout/Fab';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { TaskRow } from '@/components/tasks/TaskRow';
import { TaskSheet } from '@/components/tasks/TaskSheet';
import { StatusSheet } from '@/components/tasks/StatusSheet';
import {
  DropdownRow,
  monthKey,
  monthLabel,
  weekOfMonth,
  WEEK_OPTIONS,
} from '@/components/filters/DropdownRow';
import {
  DateRangeSheet,
  type AppliedRange,
} from '@/components/filters/DateRangeSheet';
import { SortFilterScreen } from '@/components/filters/SortFilterScreen';
import { useTasks } from '@/lib/query/hooks';
import { groupByDay, taskDate, cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

type StatusFilter = 'all' | 'pending' | 'done' | 'concern';
type SortKey = 'newest' | 'oldest' | 'priority' | 'status';
type SourceKey = 'all' | 'entry' | 'manual';
type RangeKey = 'all' | 'today' | 'week' | 'month' | 'custom';

function rangeParams(range: RangeKey) {
  if (range === 'all' || range === 'custom') return {};
  const now = Date.now();
  const days = range === 'today' ? 1 : range === 'week' ? 7 : 30;
  return {
    from: new Date(now - days * 86_400_000).toISOString(),
    to: new Date(now).toISOString(),
  };
}

function DoneDayGroup({
  label,
  tasks,
  onOpen,
  onStatus,
}: {
  label: string;
  tasks: Task[];
  onOpen: (task: Task) => void;
  onStatus: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="mb-3 text-[16px] text-ink-muted">{label}</p>
      {open ? (
        <div className="space-y-3">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={onOpen} onStatus={onStatus} />
          ))}
        </div>
      ) : null}
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 text-[17px] text-ink-muted"
      >
        {tasks.length} {tasks.length === 1 ? 'item' : 'items'} completed
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function TasksPage() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [source, setSource] = useState<SourceKey>('all');
  const [range, setRange] = useState<RangeKey>('all');
  const [month, setMonth] = useState('all');
  const [week, setWeek] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [customRange, setCustomRange] = useState<AppliedRange | null>(null);

  const params = useMemo(() => {
    const base: Record<string, string | undefined> = { status, sort };
    if (source !== 'all') base.source = source;
    if (range === 'custom' && customRange) {
      base.from = customRange.from.toISOString();
      base.to = customRange.to.toISOString();
    } else {
      Object.assign(base, rangeParams(range));
    }
    return base;
  }, [status, sort, source, range, customRange]);

  const { data, isLoading, isError, refetch } = useTasks(params);
  const counts = data?.counts;
  const all = useMemo(() => data?.tasks ?? [], [data]);

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(all.map((t) => monthKey(taskDate(t)))));
    keys.sort().reverse();
    return [
      { value: 'all', label: 'ALL MONTHS' },
      ...keys.map((k) => ({ value: k, label: monthLabel(k) })),
    ];
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (month !== 'all')
      list = list.filter((t) => monthKey(taskDate(t)) === month);
    if (month !== 'all' && week !== 'all')
      list = list.filter((t) => String(weekOfMonth(taskDate(t))) === week);
    return list;
  }, [all, month, week]);

  const groups = groupByDay(filtered, (t) => taskDate(t));

  const statusChips: {
    key: StatusFilter;
    label: string;
    count?: number;
    cls: string;
  }[] = [
    { key: 'all', label: 'ALL', count: counts?.all, cls: 'bg-primary/20 text-primary-soft' },
    { key: 'done', label: 'DONE', count: counts?.done, cls: 'bg-success/15 text-success' },
    { key: 'pending', label: 'PENDING', count: counts?.pending, cls: 'bg-ai/15 text-ai' },
    { key: 'concern', label: 'CONCERN', count: counts?.concern, cls: 'bg-danger/15 text-danger' },
  ];

  return (
    <Screen
      header={
        <>
          <AppHeader
            right={
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Sort & filter"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-bg-deep transition active:scale-95"
                >
                  <Menu className="h-5 w-5" strokeWidth={3} />
                </button>
                <Link
                  href="/tasks/calendar"
                  aria-label="Calendar view"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink-secondary transition active:scale-95"
                >
                  <CalendarDays className="h-6 w-6" strokeWidth={1.75} />
                </Link>
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
        <div className="space-y-3">
          <DropdownRow
            value={month}
            options={monthOptions}
            onChange={(v) => {
              setMonth(v);
              setWeek('all');
            }}
            divider
          />
          <DropdownRow value={week} options={WEEK_OPTIONS} onChange={setWeek} />
        </div>

        {range === 'custom' && customRange && (
          <button
            onClick={() => {
              setRange('all');
              setCustomRange(null);
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-[13px] text-primary-soft"
          >
            {customRange.label}
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="mt-4 flex gap-2.5 overflow-x-auto no-scrollbar">
          {statusChips.map((c) => (
            <button
              key={c.key}
              onClick={() => setStatus(c.key)}
              className={cn(
                'shrink-0 rounded-lg px-3.5 py-2 text-[14px] font-bold tracking-wide transition active:scale-95',
                c.cls,
                status === c.key
                  ? 'ring-1 ring-current'
                  : 'opacity-80',
              )}
            >
              {c.count ?? 0} {c.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No tasks yet"
              description="Tasks are pulled from your journal entries automatically — or add your own with the + button."
            />
          ) : (
            <div className="space-y-7">
              {groups.map((g) => {
                const allDone =
                  g.items.length > 0 &&
                  g.items.every((t) => t.status === 'done');
                if (allDone && status === 'all') {
                  return (
                    <DoneDayGroup
                      key={g.day}
                      label={g.label}
                      tasks={g.items}
                      onOpen={setEditTask}
                      onStatus={setStatusTask}
                    />
                  );
                }
                return (
                  <div key={g.day}>
                    <p className="mb-1 text-[16px] text-ink-muted">{g.label}</p>
                    <p className="mb-3 text-[14px] text-ink-muted/70">
                      ({g.items.length})
                    </p>
                    <div className="space-y-3.5">
                      {g.items.map((t) => (
                        <TaskRow
                          key={t.id}
                          task={t}
                          onOpen={setEditTask}
                          onStatus={setStatusTask}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SortFilterScreen
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onReset={() => {
          setSort('newest');
          setRange('all');
          setSource('all');
          setCustomRange(null);
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
            label: 'Date Range',
            value: range,
            onChange: (v) => {
              if (v === 'custom') {
                setFiltersOpen(false);
                setDateSheetOpen(true);
              } else {
                setRange(v as RangeKey);
              }
            },
            options: [
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              {
                value: 'custom',
                label:
                  range === 'custom' && customRange
                    ? customRange.label
                    : 'Custom',
              },
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

      <TaskSheet open={addOpen} onClose={() => setAddOpen(false)} />
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

      <DateRangeSheet
        open={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        onApply={(r) => {
          setCustomRange(r);
          setRange('custom');
        }}
      />
    </Screen>
  );
}
