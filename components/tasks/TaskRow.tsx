'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateTask } from '@/lib/query/hooks';
import type { Task } from '@/lib/types';

export function TaskRow({ task }: { task: Task }) {
  const update = useUpdateTask();
  const done = task.status === 'done';
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5">
      <button
        onClick={() =>
          update.mutate({ id: task.id, status: done ? 'pending' : 'done' })
        }
        aria-label={done ? 'Mark as pending' : 'Mark as done'}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
          done
            ? 'border-success bg-success text-white'
            : 'border-ink-muted hover:border-ink-secondary',
        )}
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[15px] leading-snug',
            done ? 'text-ink-muted line-through' : 'text-ink-primary',
          )}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
          {task.priority === 'high' && (
            <span className="rounded-full bg-danger/15 px-2 py-0.5 font-medium text-danger">
              High priority
            </span>
          )}
          {task.sourceEntryNumber != null && (
            <span className="rounded-full bg-surface-high px-2 py-0.5 text-ink-secondary">
              Entry #{task.sourceEntryNumber}
            </span>
          )}
          {task.source === 'manual' && (
            <span className="rounded-full bg-surface-high px-2 py-0.5 text-ink-secondary">
              Manual
            </span>
          )}
          {task.isConcern && (
            <span className="rounded-full bg-ai/15 px-2 py-0.5 text-ai">
              Concern
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
