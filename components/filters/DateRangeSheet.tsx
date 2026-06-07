'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
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

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DateRangeSheet({ open, onClose, onApply }: Props) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  function pick(d: Date) {
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
  const lead = getDay(monthStart);
  const inRange = (d: Date) =>
    !!from && !!to && isWithinInterval(d, { start: from, end: to });

  return (
    <Sheet open={open} onClose={onClose} title="Custom Date Range">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonth(addMonths(month, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-ink-secondary" />
          </button>
          <span className="font-display text-[15px] font-semibold">
            {format(month, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-ink-secondary" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-ink-muted">
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: lead }).map((_, i) => (
            <span key={`lead-${i}`} />
          ))}
          {days.map((d) => {
            const selected =
              (from && isSameDay(d, from)) || (to && isSameDay(d, to));
            const range = inRange(d);
            return (
              <button
                key={d.toISOString()}
                onClick={() => pick(d)}
                className={cn(
                  'aspect-square rounded-lg text-[13px] transition',
                  selected
                    ? 'bg-primary font-semibold text-white'
                    : range
                      ? 'bg-primary/20 text-ink-primary'
                      : 'text-ink-secondary hover:bg-surface-high',
                )}
              >
                {format(d, 'd')}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip onClick={() => quick(7)}>Last 7 days</Chip>
          <Chip onClick={() => quick(30)}>Last 30 days</Chip>
          <Chip onClick={() => quick(90)}>Last 3 months</Chip>
        </div>

        <Button fullWidth size="lg" onClick={apply} disabled={!from}>
          Apply Range
        </Button>
      </div>
    </Sheet>
  );
}
