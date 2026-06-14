'use client';

import { Menu } from 'lucide-react';
import { useDrawer } from './drawer-context';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

export function AppHeader({ right }: { right?: React.ReactNode }) {
  const { setOpen } = useDrawer();
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-2">
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-bg-deep transition active:scale-95"
        >
          <Menu className="h-5 w-5" strokeWidth={3} />
        </button>
        <div>
          <p className="font-display text-[19px] font-bold leading-tight tracking-[0.18em] text-ink-primary">
            {APP_NAME}
          </p>
          <p className="text-[11px] tracking-[0.18em] text-primary-soft">
            {APP_TAGLINE}
          </p>
        </div>
      </div>
      {right}
    </header>
  );
}
