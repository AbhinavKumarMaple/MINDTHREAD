import Link from 'next/link';
import { formatTime } from '@/lib/utils';
import { Badge } from '../ui/Badge';
import { EmotionTag } from './EmotionTag';
import type { Entry } from '@/lib/types';

function statusBadge(entry: Entry) {
  switch (entry.status) {
    case 'processed':
      return <Badge tone="processed">Processed</Badge>;
    case 'processing':
      return <Badge tone="processing">Processing</Badge>;
    case 'error':
      return <Badge tone="concern">Error</Badge>;
    default:
      return <Badge tone="draft">Draft</Badge>;
  }
}

export function EntryCard({ entry }: { entry: Entry }) {
  const firstLine = entry.rawDump.split('\n').find((l) => l.trim()) ?? '';
  const title = entry.title ?? (firstLine.slice(0, 44) || 'Untitled entry');
  return (
    <Link
      href={`/entry/${entry.id}`}
      className="block rounded-2xl border border-line bg-surface p-4 transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[17px] font-semibold leading-snug text-ink-primary">
          {title}
        </h3>
        {statusBadge(entry)}
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        {formatTime(entry.createdAt)} · Entry #{entry.entryNumber}
        {entry.isConcern && (
          <span className="ml-2 text-ai">• flagged</span>
        )}
      </p>
      {entry.emotions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.emotions.map((e) => (
            <EmotionTag key={e} name={e} />
          ))}
        </div>
      )}
    </Link>
  );
}
