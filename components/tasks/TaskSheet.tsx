'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, CheckCircle2, Ban, Circle } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/query/hooks';
import { cn } from '@/lib/utils';
import type { Priority, Task, TaskStatus } from '@/lib/types';

const PRIORITIES: Priority[] = ['low', 'normal', 'high'];

const STATUSES: {
  value: TaskStatus;
  label: string;
  icon: typeof CheckCircle2;
  tint: string;
}[] = [
  { value: 'pending', label: 'Pending', icon: Circle, tint: 'text-ai' },
  { value: 'done', label: 'Done', icon: CheckCircle2, tint: 'text-success' },
  { value: 'cancelled', label: 'Cancelled', icon: Ban, tint: 'text-ink-muted' },
];

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

// Combine the date + time fields into a single ISO datetime, or null if no date.
function combineDueDate(date: string, time: string): string | null {
  if (!date) return null;
  const dt = new Date(`${date}T${time || '09:00'}`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

const inputCls =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-ink-primary outline-none transition focus:border-primary [color-scheme:dark]';

export function TaskSheet({
  open,
  onClose,
  task,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  /** Pre-fill the date when adding from a calendar day. */
  defaultDate?: Date | null;
}) {
  const isEdit = !!task;
  const create = useCreateTask();
  const update = useUpdateTask();
  const del = useDeleteTask();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Seed the form whenever the sheet opens or its target changes.
  useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setDate(toDateInput(task.dueDate));
      setTime(toTimeInput(task.dueDate));
      setNotes(task.notes ?? '');
    } else {
      setTitle('');
      setPriority('normal');
      setDate(defaultDate ? toDateInput(defaultDate.toISOString()) : '');
      setTime('');
      setNotes('');
    }
    setConfirmDelete(false);
  }, [open, task, defaultDate]);

  const busy = create.isPending || update.isPending || del.isPending;

  async function save() {
    const t = title.trim();
    if (!t) return;
    const dueDate = combineDueDate(date, time);
    const trimmed = notes.trim();
    if (isEdit && task) {
      await update.mutateAsync({
        id: task.id,
        title: t,
        priority,
        dueDate,
        notes: trimmed || null,
      });
    } else {
      await create.mutateAsync({
        title: t,
        priority,
        dueDate: dueDate ?? undefined,
        notes: trimmed || undefined,
      });
    }
    onClose();
  }

  async function applyStatus(status: TaskStatus) {
    if (!task || task.status === status) return;
    await update.mutateAsync({ id: task.id, status });
    onClose();
  }

  async function remove() {
    if (!task) return;
    await del.mutateAsync(task.id);
    onClose();
  }

  // Append a bullet on a fresh line so users can build a quick list.
  function addBullet() {
    setNotes((n) => {
      if (!n.trim()) return '• ';
      return n.endsWith('\n') ? `${n}• ` : `${n}\n• `;
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'Edit task' : 'New task'}>
      <div className="space-y-4">
        <Field
          label="Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          autoFocus={!isEdit}
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
              Time
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>
        {date && (
          <button
            type="button"
            onClick={() => {
              setDate('');
              setTime('');
            }}
            className="-mt-1 text-[13px] text-ink-muted underline-offset-2 hover:underline"
          >
            Clear date
          </button>
        )}

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-secondary">
            Priority
          </p>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                active={priority === p}
                onClick={() => setPriority(p)}
                className="capitalize"
              >
                {p}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-secondary">
              Notes
            </span>
            <button
              type="button"
              onClick={addBullet}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-high px-2.5 py-1 text-[12px] font-semibold text-ink-secondary transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> Bullet
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add details, bullet points, links…"
            rows={4}
            className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink-primary outline-none transition placeholder:text-ink-muted focus:border-primary"
          />
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={save}
          loading={create.isPending || update.isPending}
          disabled={!title.trim()}
        >
          {isEdit ? 'Save changes' : 'Add task'}
        </Button>

        {isEdit && task && (
          <div className="space-y-3 pt-1">
            <p className="text-[13px] font-medium text-ink-secondary">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => {
                const active = task.status === s.value;
                const Icon = s.icon;
                return (
                  <button
                    key={s.value}
                    onClick={() => applyStatus(s.value)}
                    disabled={busy}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-[13px] font-medium transition active:scale-95 disabled:opacity-50',
                      active
                        ? 'border-primary bg-primary/10 text-ink-primary'
                        : 'border-line bg-surface text-ink-secondary',
                    )}
                  >
                    <Icon className={cn('h-5 w-5', s.tint)} />
                    {s.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}
              disabled={busy}
              className={cn(
                'flex h-11 w-full items-center justify-center gap-2 rounded-2xl border text-[15px] font-semibold transition active:scale-95 disabled:opacity-50',
                confirmDelete
                  ? 'border-danger bg-danger text-white'
                  : 'border-line bg-surface text-danger',
              )}
            >
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? 'Tap again to delete' : 'Delete task'}
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
