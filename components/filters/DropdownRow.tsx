'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DropdownRow({
  value,
  options,
  onChange,
  divider,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  divider?: boolean;
}) {
  return (
    <div className={cn(divider && 'border-b border-line/60 pb-3')}>
      <div className="relative inline-flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent pr-7 text-[15px] font-semibold uppercase tracking-[0.15em] text-primary-soft outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-ink-muted" />
      </div>
    </div>
  );
}

export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1)
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    .toUpperCase();
}

export function weekOfMonth(iso: string): number {
  return Math.min(5, Math.floor((new Date(iso).getDate() - 1) / 7) + 1);
}

export const WEEK_OPTIONS = [
  { value: 'all', label: 'ALL WEEKS' },
  { value: '1', label: 'WEEK 1' },
  { value: '2', label: 'WEEK 2' },
  { value: '3', label: 'WEEK 3' },
  { value: '4', label: 'WEEK 4' },
  { value: '5', label: 'WEEK 5' },
];
