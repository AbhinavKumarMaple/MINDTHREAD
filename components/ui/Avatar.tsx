import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-sm font-semibold text-white',
        className,
      )}
    >
      {initials(name || 'J')}
    </div>
  );
}
