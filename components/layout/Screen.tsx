import { cn } from '@/lib/utils';
import { StatusBar } from './StatusBar';
import { HomeIndicator } from './HomeIndicator';

interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  floating?: React.ReactNode;
  statusBar?: boolean;
  homeIndicator?: boolean;
  scrollClassName?: string;
  className?: string;
}

export function Screen({
  children,
  header,
  footer,
  floating,
  statusBar = true,
  homeIndicator = true,
  scrollClassName,
  className,
}: ScreenProps) {
  return (
    <div className={cn('relative flex h-full flex-col bg-bg-base', className)}>
      {statusBar && <StatusBar />}
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
      {homeIndicator && <HomeIndicator />}
    </div>
  );
}
