'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert, Check, TrendingDown, TrendingUp } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useConcerns, useUpdateEntry } from '@/lib/query/hooks';
import { formatMetaDate, cn } from '@/lib/utils';
import type { Entry } from '@/lib/types';

function ConcernCard({ entry }: { entry: Entry }) {
  const update = useUpdateEntry(entry.id);
  const resolved = entry.concernStatus === 'resolved';
  const trigger = entry.themes[0];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-danger" />
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[19px] font-bold leading-snug text-ink-primary">
          {entry.title ?? 'Untitled'}
        </p>
        <span className="shrink-0 rounded-full border border-danger/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger">
          Concern
        </span>
      </div>
      <p className="mt-1 text-[13px] text-ink-muted">
        {formatMetaDate(entry.createdAt)}
      </p>
      <p className="mt-3 text-[15px] italic leading-relaxed text-ink-secondary">
        "{(entry.summary ?? entry.rawDump).slice(0, 140)}..."
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3.5">
        {trigger ? (
          <Link
            href={`/analysis/theme/${encodeURIComponent(trigger)}`}
            className="text-[13px] text-primary-soft"
          >
            AI: Possible trigger →{' '}
            <span className="capitalize underline-offset-2">
              {trigger.replace(/-/g, ' ')}
            </span>
          </Link>
        ) : (
          <span />
        )}
        <button
          onClick={() =>
            update.mutate({
              concernStatus: resolved ? 'unresolved' : 'resolved',
            })
          }
          disabled={update.isPending}
          className={cn(
            'flex items-center gap-2 text-[13px]',
            resolved ? 'text-success' : 'text-ink-muted',
          )}
        >
          {resolved ? 'Resolved' : 'Mark resolved'}
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border-2',
              resolved
                ? 'border-success bg-success text-white'
                : 'border-ink-muted',
            )}
          >
            {resolved && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ConcernsPage() {
  const router = useRouter();
  const { data, isLoading } = useConcerns();
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>(
    'all',
  );

  const { thisMonth, lastMonth } = useMemo(() => {
    const now = new Date();
    const tm: Entry[] = [];
    let lm = 0;
    for (const e of data?.entries ?? []) {
      const d = new Date(e.createdAt);
      if (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      ) {
        tm.push(e);
      } else if (
        (now.getMonth() === 0 &&
          d.getMonth() === 11 &&
          d.getFullYear() === now.getFullYear() - 1) ||
        (d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() - 1)
      ) {
        lm += 1;
      }
    }
    return { thisMonth: tm, lastMonth: lm };
  }, [data]);

  const entries = (data?.entries ?? []).filter((e) => {
    const s = e.concernStatus ?? 'unresolved';
    if (filter === 'unresolved') return s !== 'resolved';
    if (filter === 'resolved') return s === 'resolved';
    return true;
  });

  const improving = thisMonth.length <= lastMonth;

  return (
    <Screen
      header={
        <div className="flex items-center gap-3 px-5 pb-5 pt-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="text-ink-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center font-display text-[22px] font-bold text-ink-primary">
            Concern Tracker
          </h1>
          <span className="shrink-0 rounded-full bg-danger/15 px-2.5 py-1 text-[11px] font-bold text-danger">
            {thisMonth.length} this month
          </span>
        </div>
      }
    >
      <div className="px-5 pb-10">
        {isLoading ? (
          <LoadingState />
        ) : !data || data.counts.total === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Nothing flagged"
            description="When an entry shows meaningful distress, MINDTHREAD gently tracks it here so you can keep an eye on it."
          />
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6">
              <span className="absolute inset-y-0 left-0 w-[3px] bg-danger" />
              <p className="font-display text-[26px] font-bold text-danger">
                {data.counts.total} flagged{' '}
                {data.counts.total === 1 ? 'entry' : 'entries'}
              </p>
              <p className="mt-1 text-[15px] text-ink-muted">
                out of {data.totalEntries} total ({data.flaggedPct}%)
              </p>
              <p className="mt-2.5 flex items-center gap-1.5 text-[14px] text-ink-muted">
                vs last month: {lastMonth}
                <span
                  className={cn(
                    'flex items-center gap-1 font-semibold',
                    improving ? 'text-success' : 'text-danger',
                  )}
                >
                  {improving ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  {improving ? 'Improving' : 'Rising'}
                </span>
              </p>
            </div>

            <div className="mt-5 flex gap-2.5">
              {(
                [
                  ['all', 'All'],
                  ['unresolved', 'Unresolved'],
                  ['resolved', 'Resolved'],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={cn(
                    'rounded-full px-5 py-2 text-[14px] transition active:scale-95',
                    filter === k
                      ? 'bg-primary font-semibold text-white'
                      : 'bg-surface text-ink-secondary',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              {entries.map((e) => (
                <ConcernCard key={e.id} entry={e} />
              ))}
              {entries.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-muted">
                  Nothing here.
                </p>
              )}
            </div>

            <button
              onClick={() => {
                if (!data) return;
                const lines = [
                  'MINDTHREAD — Concern Report',
                  `Flagged: ${data.counts.total} of ${data.totalEntries} entries (${data.flaggedPct}%)`,
                  '',
                  ...data.entries.map((e) =>
                    [
                      `${e.title ?? 'Untitled'}  [${e.concernStatus ?? 'unresolved'}]`,
                      new Date(e.createdAt).toLocaleString(),
                      e.summary ?? e.rawDump,
                      '',
                    ].join('\n'),
                  ),
                ];
                const blob = new Blob([lines.join('\n')], {
                  type: 'text/plain',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mindthread-concern-report.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="mt-7 block w-full text-center text-[15px] font-semibold text-primary-soft"
            >
              Export concern report →
            </button>
          </>
        )}
      </div>
    </Screen>
  );
}
