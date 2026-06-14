'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  isBefore,
  getDay,
} from 'date-fns';
import { cn } from '@/lib/utils';

export interface AppliedRange {
  from: Date;
  to: Date;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (range: AppliedRange) => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function DateRangeSheet({ open, onClose, onApply }: Props) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [quickActive, setQuickActive] = useState<number | null>(null);

  if (!open) return null;

  function pick(d: Date) {
    setQuickActive(null);
    if (!from || (from && to)) {
      setFrom(d);
      setTo(null);
    } else if (isBefore(d, from)) {
      setTo(from);
      setFrom(d);
    } else {
      setTo(d);
    }
  }

  function quick(days: number) {
    setQuickActive(days);
    setFrom(new Date(Date.now() - days * 86_400_000));
    setTo(new Date());
  }

  function apply() {
    if (!from) return;
    const end = to ?? from;
    onApply({
      from: startOfDay(from),
      to: endOfDay(end),
      label: `${format(from, 'MMM d')} – ${format(end, 'MMM d')}`,
    });
    onClose();
  }

  const monthStart = startOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(month) });
  const lead = (getDay(monthStart) + 6) % 7; // Monday-first
  const inRange = (d: Date) =>
    !!from && !!to && isWithinInterval(d, { start: from, end: to });
  const isEndpoint = (d: Date) =>
    (!!from && isSameDay(d, from)) || (!!to && isSameDay(d, to));

  return (
    <div className="absolute inset-0 z-50 flex animate-fade-in flex-col bg-bg-base">
      <div className="flex items-center justify-between px-5 pb-5 pt-5">
        <button
          onClick={onClose}
          aria-label="Back"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-high text-ink-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="font-display text-[22px] font-bold text-ink-primary">
          Custom Date Range
        </h2>
        <button
          onClick={apply}
          disabled={!from}
          className="text-[17px] font-semibold text-primary-soft disabled:opacity-40"
        >
          Done
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-[16px] font-semibold text-ink-secondary">
              From
            </p>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-[18px] font-semibold text-ink-primary">
                {from ? format(from, 'MMM d, yyyy') : '—'}
              </span>
              <CalendarDays className="h-5 w-5 text-primary-soft" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[16px] font-semibold text-ink-secondary">
              To
            </p>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-[18px] font-semibold text-ink-primary">
                {to ? format(to, 'MMM d, yyyy') : '—'}
              </span>
              <CalendarDays className="h-5 w-5 text-primary-soft" />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-surface p-5">
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={() => setMonth(addMonths(month, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-primary-soft" />
            </button>
            <span className="font-display text-[20px] font-bold text-ink-primary">
              {format(month, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setMonth(addMonths(month, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5 text-primary-soft" />
            </button>
          </div>

          <div className="grid grid-cols-7 pb-2 text-center text-[14px] font-semibold text-ink-muted">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1.5">
            {Array.from({ length: lead }).map((_, i) => (
              <span key={`lead-${i}`} />
            ))}
            {days.map((d) => {
              const endpoint = isEndpoint(d);
              const range = !endpoint && inRange(d);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => pick(d)}
                  className={cn(
                    'flex h-12 items-center justify-center text-[16px] transition',
                    range && 'bg-primary/20 text-ink-secondary first:rounded-l-xl last:rounded-r-xl',
                    !range && !endpoint && 'text-ink-secondary hover:bg-surface-high',
                  )}
                >
                  {endpoint ? (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-bold text-white">
                      {format(d, 'd')}
                    </span>
                  ) : (
                    format(d, 'd')
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mb-3 mt-7 text-[16px] font-bold uppercase tracking-[0.12em] text-ink-secondary">
          Quick Select
        </p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {(
            [
              [7, 'Last 7 days'],
              [30, 'Last 30 days'],
              [90, 'Last 3 months'],
            ] as [number, string][]
          ).map(([days_, label]) => (
            <button
              key={days_}
              onClick={() => quick(days_)}
              className={cn(
                'shrink-0 rounded-full px-6 py-3.5 text-[17px] transition active:scale-95',
                quickActive === days_
                  ? 'bg-primary font-semibold text-white'
                  : 'bg-surface text-ink-secondary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-6">
        <button
          onClick={apply}
          disabled={!from}
          className="w-full rounded-full bg-gradient-to-r from-primary-700 to-primary-soft py-5 text-center font-display text-[20px] font-bold text-white shadow-glow-primary transition active:scale-[0.99] disabled:opacity-50"
        >
          Apply Range
        </button>
      </div>
    </div>
  );
}
