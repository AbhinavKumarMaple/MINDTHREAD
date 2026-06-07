import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted',
        className,
      )}
    >
      {children}
    </p>
  );
}
