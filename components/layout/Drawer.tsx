'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookText,
  CheckSquare,
  Sparkles,
  Activity,
  Settings,
  X,
  ChevronRight,
} from 'lucide-react';
import { useDrawer } from './drawer-context';
import { useMe, useLogout } from '@/lib/query/hooks';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/utils';

const items = [
  { href: '/journal', label: 'Journal', icon: BookText },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/analysis/insights', label: 'Insights', icon: Sparkles },
  { href: '/analysis', label: 'Patterns', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Drawer() {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useMe();
  const logout = useLogout();

  if (!open) return null;
  const name = data?.user?.displayName ?? 'Journal';

  async function signOut() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  function isActive(href: string) {
    if (href === '/journal')
      return pathname.startsWith('/journal') || pathname.startsWith('/entry');
    if (href === '/analysis') return pathname === '/analysis';
    return pathname.startsWith(href);
  }

  return (
    <div className="absolute inset-0 z-[60]">
      <button
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 animate-fade-in bg-black/70"
      />
      <aside className="absolute inset-y-0 left-0 flex w-[80%] max-w-[320px] animate-slide-in-left flex-col border-r border-line bg-surface px-5 pb-8 pt-12">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-11 text-ink-secondary"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <Avatar name={name} className="h-12 w-12" />
          <div>
            <p className="font-display text-lg font-semibold">Hey, {name}</p>
            <p className="text-xs text-ink-muted">mindthread user</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition',
                  active
                    ? 'bg-primary/15 text-ink-primary'
                    : 'text-ink-secondary hover:bg-white/5',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-4 w-4 text-primary-soft" />}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={signOut}
          className="mt-auto text-left text-[15px] font-medium text-danger"
        >
          Sign out
        </button>
      </aside>
    </div>
  );
}
