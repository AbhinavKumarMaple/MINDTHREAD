'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/journal', label: 'Notes' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/analysis', label: 'AI Analysis' },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <div className="flex border-b border-line/60">
      {tabs.map((t) => {
        const active =
          t.href === '/journal'
            ? pathname.startsWith('/journal')
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'relative flex-1 pb-3.5 pt-1 text-center text-[17px] transition',
              active
                ? 'font-semibold text-ink-primary'
                : 'text-ink-muted',
            )}
          >
            {t.label}
            {active && (
              <span className="absolute inset-x-6 bottom-0 h-[3px] rounded-full bg-white" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
