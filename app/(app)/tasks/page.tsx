'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ListChecks, SlidersHorizontal, X, CalendarDays } from 'lucide-react';
import {
  DateRangeSheet,
  type AppliedRange,
} from '@/components/filters/DateRangeSheet';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Fab } from '@/components/layout/Fab';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Sheet } from '@/components/ui/Sheet';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { TaskRow } from '@/components/tasks/TaskRow';
import { useTasks, useCreateTask } from '@/lib/query/hooks';
import { groupByDay } from '@/lib/utils';
import type { Priority } from '@/lib/types';

type StatusFilter = 'all' | 'pending' | 'done' | 'concern';
type SortKey = 'newest' | 'oldest' | 'priority';
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

export default function TasksPage() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [range, setRange] = useState<RangeKey>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [customRange, setCustomRange] = useState<AppliedRange | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('normal');

  const params = useMemo(() => {
    const base: Record<string, string | undefined> = { status, sort };
    if (range === 'custom' && customRange) {
      base.from = customRange.from.toISOString();
      base.to = customRange.to.toISOString();
    } else {
      Object.assign(base, rangeParams(range));
    }
    return base;
  }, [status, sort, range, customRange]);
  const { data, isLoading, isError, refetch } = useTasks(params);
  const create = useCreateTask();

  const counts = data?.counts;
  const groups = data ? groupByDay(data.tasks, (t) => t.createdAt) : [];

  async function addTask() {
    if (!newTitle.trim()) return;
    await create.mutateAsync({ title: newTitle.trim(), priority: newPriority });
    setNewTitle('');
    setNewPriority('normal');
    setAddOpen(false);
  }

  const statusChips: { key: StatusFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: counts?.all },
    { key: 'done', label: 'Done', count: counts?.done },
    { key: 'pending', label: 'Pending', count: counts?.pending },
    { key: 'concern', label: 'Concern', count: counts?.concern },
  ];

  return (
    <Screen
      header={
        <>
          <AppHeader
            right={
              <Link
                href="/tasks/calendar"
                aria-label="Calendar view"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-high text-ink-secondary"
              >
                <CalendarDays className="h-4 w-4" />
              </Link>
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
            className="absolute bottom-[84px] right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-action text-white shadow-card active:scale-95"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <Fab label="Add task" onClick={() => setAddOpen(true)} />
        </>
      }
    >
      <div className="px-4 pb-4 pt-3">
        <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {statusChips.map((c) => (
            <Chip
              key={c.key}
              active={status === c.key}
              onClick={() => setStatus(c.key)}
            >
              {c.count != null && (
                <span className="font-semibold">{c.count}</span>
              )}{' '}
              {c.label}
            </Chip>
          ))}
        </div>

        {range === 'custom' && customRange && (
          <button
            onClick={() => {
              setRange('all');
              setCustomRange(null);
            }}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-[13px] text-primary-soft"
          >
            {customRange.label}
            <X className="h-3.5 w-3.5" />
          </button>
        )}

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
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.day}>
                <p className="mb-2.5 text-[13px] font-medium text-ink-muted">
                  {g.label}
                </p>
                <div className="space-y-2.5">
                  {g.items.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Sort & Filter"
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-secondary">
              Sort by
            </p>
            <div className="flex flex-wrap gap-2">
              {(['newest', 'oldest', 'priority'] as SortKey[]).map((s) => (
                <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
                  {s === 'newest'
                    ? 'Newest first'
                    : s === 'oldest'
                      ? 'Oldest first'
                      : 'By priority'}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-secondary">
              Date range
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'All time'],
                  ['today', 'Today'],
                  ['week', 'This week'],
                  ['month', 'This month'],
                ] as [RangeKey, string][]
              ).map(([k, label]) => (
                <Chip key={k} active={range === k} onClick={() => setRange(k)}>
                  {label}
                </Chip>
              ))}
              <Chip
                active={range === 'custom'}
                onClick={() => {
                  setFiltersOpen(false);
                  setDateSheetOpen(true);
                }}
              >
                {range === 'custom' && customRange ? customRange.label : 'Custom'}
              </Chip>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={() => setFiltersOpen(false)}>
            Apply filters
          </Button>
        </div>
      </Sheet>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="New task">
        <div className="space-y-4">
          <Field
            label="Task"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What do you need to do?"
            autoFocus
          />
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-secondary">
              Priority
            </p>
            <div className="flex gap-2">
              {(['low', 'normal', 'high'] as Priority[]).map((p) => (
                <Chip
                  key={p}
                  active={newPriority === p}
                  onClick={() => setNewPriority(p)}
                  className="capitalize"
                >
                  {p}
                </Chip>
              ))}
            </div>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={addTask}
            loading={create.isPending}
          >
            Add task
          </Button>
        </div>
      </Sheet>

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
