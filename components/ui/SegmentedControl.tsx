'use client';

import { cn } from '@/lib/utils';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex rounded-xl bg-surface-high p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-lg py-2 text-[13px] font-medium transition',
            value === o.value
              ? 'bg-primary text-white shadow-sm'
              : 'text-ink-secondary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
