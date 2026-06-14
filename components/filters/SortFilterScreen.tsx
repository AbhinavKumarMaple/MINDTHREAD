'use client';

import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PillOption {
  value: string;
  label: string;
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-[18px] font-bold tracking-[0.06em] text-ink-secondary">
        {label}
      </p>
      <div className="flex flex-wrap gap-3.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-full px-6 py-3.5 text-[17px] transition active:scale-95',
              value === o.value
                ? 'bg-primary font-semibold text-white'
                : 'bg-surface text-ink-secondary',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface Section {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (v: string) => void;
}

export function SortFilterScreen({
  open,
  onClose,
  onReset,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  sections: Section[];
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex animate-fade-in flex-col bg-bg-base">
      <div className="flex items-center justify-between px-5 pb-7 pt-5">
        <button
          onClick={onClose}
          aria-label="Back"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-high text-ink-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="font-display text-[22px] font-bold text-ink-primary">
          Sort & Filter
        </h2>
        <button
          onClick={onReset}
          className="text-[15px] font-bold uppercase tracking-[0.08em] text-primary-soft"
        >
          Reset
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-9 overflow-y-auto px-5 pb-6 no-scrollbar">
        {sections.map((s) => (
          <PillGroup key={s.label} {...s} />
        ))}
      </div>

      <div className="px-5 pb-6">
        <button
          onClick={onClose}
          className="w-full rounded-full bg-gradient-to-r from-primary-700 to-primary-soft py-5 text-center font-display text-[20px] font-bold text-white shadow-glow-primary transition active:scale-[0.99]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
