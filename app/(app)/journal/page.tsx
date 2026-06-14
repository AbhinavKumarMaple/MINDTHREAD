'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookText, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import {
  DropdownRow,
  monthKey,
  monthLabel,
  weekOfMonth,
  WEEK_OPTIONS,
} from '@/components/filters/DropdownRow';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Fab } from '@/components/layout/Fab';
import { ToneChip } from '@/components/layout/ToneChip';
import { EntryCard } from '@/components/journal/EntryCard';
import { Button } from '@/components/ui/Button';
import { ErrorState, EmptyState } from '@/components/ui/states';
import { EntryListSkeleton } from '@/components/ui/skeletons';
import { SortFilterScreen } from '@/components/filters/SortFilterScreen';
import {
  DateRangeSheet,
  type AppliedRange,
} from '@/components/filters/DateRangeSheet';
import { useEntries, useMe, useCreateEntry } from '@/lib/query/hooks';
import { groupByDay, cn } from '@/lib/utils';
import type { Entry } from '@/lib/types';

type Sort = 'newest' | 'oldest';
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

export default function JournalPage() {
  const router = useRouter();
  const me = useMe();
  const create = useCreateEntry();
  const [sort, setSort] = useState<Sort>('newest');
  const [range, setRange] = useState<RangeKey>('all');
  const [customRange, setCustomRange] = useState<AppliedRange | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [month, setMonth] = useState('all');
  const [week, setWeek] = useState('all');

  const params = useMemo(() => {
    const base: Record<string, string | undefined> = { sort };
    if (range === 'custom' && customRange) {
      base.from = customRange.from.toISOString();
      base.to = customRange.to.toISOString();
    } else {
      Object.assign(base, rangeParams(range));
    }
    return base;
  }, [sort, range, customRange]);

  const entries = useEntries(params);
  const tone = me.data?.user?.tone ?? 'warm';
  const all = useMemo(() => entries.data?.entries ?? [], [entries.data]);

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(all.map((e) => monthKey(e.createdAt))));
    keys.sort().reverse();
    return [
      { value: 'all', label: 'ALL MONTHS' },
      ...keys.map((k) => ({ value: k, label: monthLabel(k) })),
    ];
  }, [all]);

  const filtered = useMemo(() => {
    let list: Entry[] = all;
    if (month !== 'all') list = list.filter((e) => monthKey(e.createdAt) === month);
    if (month !== 'all' && week !== 'all')
      list = list.filter((e) => String(weekOfMonth(e.createdAt)) === week);
    return list;
  }, [all, month, week]);

  const groups = groupByDay(filtered, (e) => e.createdAt);
  const isFiltered =
    range !== 'all' || sort !== 'newest' || month !== 'all' || week !== 'all';

  async function newEntry() {
    const { entry } = await create.mutateAsync({ rawDump: '' });
    router.push(`/entry/${entry.id}`);
  }

  function clearFilters() {
    setRange('all');
    setSort('newest');
    setCustomRange(null);
    setMonth('all');
    setWeek('all');
  }

  return (
    <Screen
      header={
        <>
          <AppHeader right={<ToneChip tone={tone} />} />
          <TabBar />
        </>
      }
      floating={
        <>
          <Link
            href="/chat"
            aria-label="Ask AI"
            className="absolute right-5 top-[150px] z-30 flex h-12 items-center gap-1.5 rounded-full bg-ai px-5 text-[16px] font-bold text-black shadow-glow active:scale-95"
          >
            <Sparkles className="h-4 w-4" fill="currentColor" />
            AI
          </Link>
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label="Sort & filter"
            className="absolute bottom-[88px] right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-action text-white shadow-card active:scale-95"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <Fab label="New entry" onClick={newEntry} />
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

        <div className="mt-4">
          {entries.isLoading ? (
            <EntryListSkeleton />
          ) : entries.isError ? (
            <ErrorState onRetry={() => entries.refetch()} />
          ) : groups.length === 0 ? (
            isFiltered ? (
              <EmptyState
                icon={BookText}
                title="No entries match"
                description="Try adjusting or clearing your filters."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={BookText}
                title="Your journal is empty"
                description="Tap the + button to write your first brain dump — then let your AI process it into something meaningful."
                action={
                  <Button onClick={newEntry} loading={create.isPending}>
                    Write first entry
                  </Button>
                }
              />
            )
          ) : (
            <div className="space-y-7">
              {groups.map((g) => (
                <div key={g.day}>
                  <p className="mb-3 text-[16px] text-ink-muted">{g.label}</p>
                  <div className="space-y-4">
                    {g.items.map((e) => (
                      <EntryCard key={e.id} entry={e} />
                    ))}
                  </div>
                </div>
              ))}
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
          setCustomRange(null);
          setMonth('all');
          setWeek('all');
        }}
        sections={[
          {
            label: 'Sort By',
            value: sort,
            onChange: (v) => setSort(v as Sort),
            options: [
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
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
        ]}
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
