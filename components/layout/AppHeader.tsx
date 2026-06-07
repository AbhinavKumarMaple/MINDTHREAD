'use client';

import { Menu } from 'lucide-react';
import { useDrawer } from './drawer-context';
import { IconButton } from '../ui/IconButton';
import { APP_NAME } from '@/lib/constants';

export function AppHeader({ right }: { right?: React.ReactNode }) {
  const { setOpen } = useDrawer();
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-1">
      <IconButton onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </IconButton>
      <div className="flex flex-col items-center">
        <span className="font-display text-[17px] font-bold tracking-[0.22em] text-ink-primary">
          {APP_NAME}
        </span>
        <span className="text-[8px] uppercase tracking-[0.25em] text-ink-muted">
          your second mind
        </span>
      </div>
      <div className="flex min-w-[40px] items-center justify-end">
        {right}
      </div>
    </header>
  );
}
