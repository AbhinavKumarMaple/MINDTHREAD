import { cn } from '@/lib/utils';

interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  floating?: React.ReactNode;
  scrollClassName?: string;
  className?: string;
}

export function Screen({
  children,
  header,
  footer,
  floating,
  scrollClassName,
  className,
}: ScreenProps) {
  return (
    <div
      className={cn(
        'relative flex h-full flex-col bg-bg-base pt-3',
        className,
      )}
    >
      {header}
      <div
        className={cn(
          'relative min-h-0 flex-1 overflow-y-auto no-scrollbar',
          scrollClassName,
        )}
      >
        {children}
      </div>
      {floating}
      {footer}
    </div>
  );
}
