'use client';

import { CheckCircle2, Ban, Circle, Check } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { useUpdateTask } from '@/lib/query/hooks';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/lib/types';

const OPTIONS: {
  value: TaskStatus;
  label: string;
  desc: string;
  icon: typeof CheckCircle2;
  tint: string;
}[] = [
  {
    value: 'done',
    label: 'Done',
    desc: 'Completed this task',
    icon: CheckCircle2,
    tint: 'text-success',
  },
  {
    value: 'cancelled',
    label: 'Cancel task',
    desc: "Won't do this anymore",
    icon: Ban,
    tint: 'text-ink-muted',
  },
  {
    value: 'pending',
    label: 'Mark as pending',
    desc: 'Back to your to-do list',
    icon: Circle,
    tint: 'text-ai',
  },
];

export function StatusSheet({
  open,
  onClose,
  task,
}: {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}) {
  const update = useUpdateTask();

  async function set(status: TaskStatus) {
    if (!task || task.status === status) {
      onClose();
      return;
    }
    await update.mutateAsync({ id: task.id, status });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Set status">
      <div className="space-y-3">
        {OPTIONS.map((o) => {
          const active = task?.status === o.value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              onClick={() => set(o.value)}
              disabled={update.isPending}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-2xl border bg-surface px-4 py-3.5 text-left transition active:scale-[0.99] disabled:opacity-60',
                active ? 'border-primary' : 'border-line',
              )}
            >
              <Icon className={cn('h-6 w-6 shrink-0', o.tint)} />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] text-ink-primary">{o.label}</p>
                <p className="text-[13px] text-ink-muted">{o.desc}</p>
              </div>
              {active && <Check className="h-5 w-5 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
