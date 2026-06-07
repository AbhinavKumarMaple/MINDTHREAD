'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookText, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Fab } from '@/components/layout/Fab';
import { ToneChip } from '@/components/layout/ToneChip';
import { EntryCard } from '@/components/journal/EntryCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import {
  DateRangeSheet,
  type AppliedRange,
} from '@/components/filters/DateRangeSheet';
import { useEntries, useMe, useCreateEntry } from '@/lib/query/hooks';
import { groupByDay } from '@/lib/utils';

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
  const groups = entries.data
    ? groupByDay(entries.data.entries, (e) => e.createdAt)
    : [];
  const isFiltered = range !== 'all' || sort !== 'newest';

  async function newEntry() {
    const { entry } = await create.mutateAsync({ rawDump: '' });
    router.push(`/entry/${entry.id}`);
  }

  function clearFilters() {
    setRange('all');
    setSort('newest');
    setCustomRange(null);
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
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label="Sort & filter"
            className="absolute bottom-[150px] right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-action text-white shadow-card active:scale-95"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <Link
            href="/chat"
            aria-label="Ask AI"
            className="absolute bottom-[84px] right-5 z-30 flex h-11 items-center gap-1.5 rounded-full bg-ai px-4 text-sm font-semibold text-black shadow-glow active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Link>
          <Fab label="New entry" onClick={newEntry} />
        </>
      }
    >
      <div className="px-4 py-4">
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

        {entries.isLoading ? (
          <LoadingState />
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
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.day}>
                <p className="mb-2.5 text-[13px] font-medium text-ink-muted">
                  {g.label}
                </p>
                <div className="space-y-3">
                  {g.items.map((e) => (
                    <EntryCard key={e.id} entry={e} />
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
              <Chip active={sort === 'newest'} onClick={() => setSort('newest')}>
                Newest first
              </Chip>
              <Chip active={sort === 'oldest'} onClick={() => setSort('oldest')}>
                Oldest first
              </Chip>
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
