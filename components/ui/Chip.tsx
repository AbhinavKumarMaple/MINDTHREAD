import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition active:scale-95',
        active
          ? 'bg-primary text-white shadow-glow-primary'
          : 'bg-surface-high text-ink-secondary hover:text-ink-primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
