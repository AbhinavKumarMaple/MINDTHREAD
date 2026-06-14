import Link from 'next/link';
import { formatMetaDate } from '@/lib/utils';
import { moodAccent } from '@/lib/constants';
import { EmotionTag } from './EmotionTag';
import type { Entry } from '@/lib/types';

function statusBadge(entry: Entry) {
  const map: Record<string, { label: string; cls: string }> = {
    processed: { label: 'PROCESSED', cls: 'border-primary-soft/60 text-primary-soft' },
    processing: { label: 'PROCESSING', cls: 'border-ai/60 text-ai' },
    error: { label: 'ERROR', cls: 'border-danger/60 text-danger' },
    draft: { label: 'DRAFT', cls: 'border-ink-muted/60 text-ink-secondary' },
  };
  const s = map[entry.status] ?? map.draft;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

export function EntryCard({ entry }: { entry: Entry }) {
  const firstLine = entry.rawDump.split('\n').find((l) => l.trim()) ?? '';
  const title = entry.title ?? (firstLine.slice(0, 44) || 'Untitled entry');
  const accent =
    entry.status === 'processed' ? moodAccent(entry.moodScore) : moodAccent(null);
  return (
    <Link
      href={`/entry/${entry.id}`}
      className="relative block overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6 transition active:scale-[0.99]"
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[22px] font-bold leading-tight text-ink-primary">
          {title}
        </h3>
        {statusBadge(entry)}
      </div>
      <p className="mt-2.5 text-[14px] text-ink-muted">
        {formatMetaDate(entry.createdAt)}
        <span className="mx-2">•</span>Entry #{entry.entryNumber}
      </p>
      {entry.emotions.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {entry.emotions.map((e) => (
            <EmotionTag key={e} name={e} />
          ))}
        </div>
      )}
    </Link>
  );
}
