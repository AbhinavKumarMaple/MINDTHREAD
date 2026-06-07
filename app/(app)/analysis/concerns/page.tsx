'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Download } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useConcerns, useUpdateEntry } from '@/lib/query/hooks';
import { formatDayLabel, cn } from '@/lib/utils';
import type { Entry, ConcernStatus } from '@/lib/types';

function ConcernCard({ entry }: { entry: Entry }) {
  const update = useUpdateEntry(entry.id);
  const current = entry.concernStatus ?? 'unresolved';
  const color =
    current === 'resolved'
      ? 'text-success'
      : current === 'improving'
        ? 'text-ai'
        : 'text-danger';
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-ink-primary">
          {entry.title ?? 'Untitled'}
        </p>
        <span className={cn('shrink-0 text-xs font-medium capitalize', color)}>
          {current}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-ink-muted">
        {formatDayLabel(entry.createdAt)}
      </p>
      <p className="mt-2 line-clamp-3 text-sm italic text-ink-secondary">
        “{entry.summary ?? entry.rawDump.slice(0, 160)}”
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(['unresolved', 'improving', 'resolved'] as ConcernStatus[]).map(
          (s) => (
            <Chip
              key={s}
              active={current === s}
              onClick={() => update.mutate({ concernStatus: s })}
              className="capitalize"
            >
              {s}
            </Chip>
          ),
        )}
      </div>
      <Link
        href={`/entry/${entry.id}`}
        className="mt-3 inline-block text-sm text-primary-soft"
      >
        Open entry →
      </Link>
    </Card>
  );
}

export default function ConcernsPage() {
  const { data, isLoading } = useConcerns();
  const [filter, setFilter] = useState<'all' | ConcernStatus>('all');

  const entries = (data?.entries ?? []).filter((e) =>
    filter === 'all' ? true : (e.concernStatus ?? 'unresolved') === filter,
  );

  function exportReport() {
    if (!data) return;
    const lines = [
      'MINDTHREAD — Concern Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Flagged: ${data.counts.total} of ${data.totalEntries} entries (${data.flaggedPct}%)`,
      `Unresolved: ${data.counts.unresolved} · Improving: ${data.counts.improving} · Resolved: ${data.counts.resolved}`,
      '',
      '----------------------------------------',
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
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindthread-concern-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Screen header={<ScreenHeader title="Concern Tracker" />}>
      <div className="space-y-5 px-5 pb-10">
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
            <Card className="border-danger/20 bg-danger/5">
              <p className="font-display text-2xl font-bold text-danger">
                {data.counts.total} flagged{' '}
                {data.counts.total === 1 ? 'entry' : 'entries'}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                out of {data.totalEntries} total ({data.flaggedPct}%)
              </p>
            </Card>

            <div className="flex flex-wrap gap-2">
              {(['all', 'unresolved', 'improving', 'resolved'] as const).map(
                (f) => (
                  <Chip
                    key={f}
                    active={filter === f}
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
                    {f}
                  </Chip>
                ),
              )}
            </div>

            <div className="space-y-3">
              {entries.map((e) => (
                <ConcernCard key={e.id} entry={e} />
              ))}
            </div>

            <Button variant="secondary" fullWidth onClick={exportReport}>
              <Download className="h-4 w-4" /> Export concern report
            </Button>
          </>
        )}
      </div>
    </Screen>
  );
}
