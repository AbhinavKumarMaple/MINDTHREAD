'use client';

import { Check, X, BookText, CalendarClock, AlignLeft } from 'lucide-react';
import { cn, formatTime, formatMetaDate } from '@/lib/utils';
import { useUpdateTask } from '@/lib/query/hooks';
import type { Task } from '@/lib/types';

function stripColor(task: Task): string {
  if (task.status === 'cancelled') return '#6B7280';
  if (task.status === 'done') return '#34D399';
  if (task.isConcern) return '#EC4899';
  if (task.priority === 'high') return '#3B82F6';
  if (task.source === 'manual') return '#F59E0B';
  return '#8B5CF6';
}

function firstLine(notes: string): string {
  const line = notes
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return line ?? '';
}

export function TaskRow({
  task,
  onOpen,
  onStatus,
}: {
  task: Task;
  onOpen?: (task: Task) => void;
  /** Open the status picker. Falls back to a quick done/pending toggle if omitted. */
  onStatus?: (task: Task) => void;
}) {
  const update = useUpdateTask();
  const done = task.status === 'done';
  const cancelled = task.status === 'cancelled';
  const muted = done || cancelled;
  const notePreview = task.notes ? firstLine(task.notes) : '';

  function handleStatus(e: React.MouseEvent) {
    e.stopPropagation();
    if (onStatus) onStatus(task);
    else update.mutate({ id: task.id, status: done ? 'pending' : 'done' });
  }

  return (
    <div
      onClick={() => onOpen?.(task)}
      role={onOpen ? 'button' : undefined}
      className={cn(
        'rounded-2xl border border-line bg-surface p-4',
        onOpen && 'cursor-pointer transition active:scale-[0.99]',
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          className="mt-1 h-12 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: stripColor(task) }}
        />
        <button
          onClick={handleStatus}
          aria-label="Change status"
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition',
            done
              ? 'border-success bg-success text-white'
              : cancelled
                ? 'border-line bg-surface-high text-ink-muted'
                : 'border-line bg-surface-raised/40 hover:border-ink-muted',
          )}
        >
          {done && <Check className="h-5 w-5" strokeWidth={3} />}
          {cancelled && <X className="h-5 w-5" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[19px] leading-snug',
              muted ? 'text-ink-muted line-through' : 'text-ink-primary',
            )}
          >
            {task.title}
          </p>
          {notePreview && (
            <p className="mt-1 flex items-center gap-1.5 truncate text-[14px] text-ink-muted">
              <AlignLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{notePreview}</span>
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[14px] text-ink-muted">
            {cancelled && (
              <span className="rounded-md bg-surface-high px-2 py-0.5 text-[12px] font-semibold text-ink-muted">
                cancelled
              </span>
            )}
            {task.isConcern && (
              <span className="rounded-md bg-action px-2 py-0.5 text-[12px] font-semibold text-white">
                {task.source === 'entry' ? 'from concern' : 'concern'}
              </span>
            )}
            {task.priority === 'high' && !muted && (
              <span className="rounded-md bg-danger/15 px-2 py-0.5 text-[12px] font-semibold text-danger">
                high
              </span>
            )}
            {task.dueDate ? (
              <span className="flex items-center gap-1.5 text-primary-soft">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatMetaDate(task.dueDate)}
              </span>
            ) : (
              <span>{formatTime(task.createdAt)}</span>
            )}
          </div>
        </div>
        {task.sourceEntryNumber != null ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-high px-2.5 py-1.5 text-[13px] font-semibold text-ink-secondary">
            <BookText className="h-3.5 w-3.5" /> Entry #{task.sourceEntryNumber}
          </span>
        ) : (
          <span className="flex shrink-0 items-center rounded-lg bg-surface-high px-2.5 py-1.5 text-[13px] font-semibold text-ink-secondary">
            Manual
          </span>
        )}
      </div>
    </div>
  );
}
