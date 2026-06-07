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
    <div className="flex items-center gap-7 border-b border-line px-5">
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
              'relative -mb-px py-3 text-[15px] font-medium transition',
              active ? 'text-ink-primary' : 'text-ink-muted',
            )}
          >
            {t.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
