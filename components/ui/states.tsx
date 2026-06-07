import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} />
  );
}

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-secondary">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">{label ?? 'Loading…'}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      {Icon && (
        <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-high text-primary-soft">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink-primary">
        {title}
      </h3>
      {description && (
        <p className="max-w-[16rem] text-sm leading-relaxed text-ink-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <h3 className="font-display text-lg font-semibold text-ink-primary">
        {title}
      </h3>
      {description && (
        <p className="max-w-[16rem] text-sm text-ink-secondary">{description}</p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-surface-high/60',
        className,
      )}
    />
  );
}
