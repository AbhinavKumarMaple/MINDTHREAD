'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  PenTool,
  CheckSquare,
  BarChart3,
  Repeat2,
  Settings,
  X,
  ChevronRight,
} from 'lucide-react';
import { useDrawer } from './drawer-context';
import { useMe, useLogout } from '@/lib/query/hooks';
import { cn } from '@/lib/utils';

const items = [
  { href: '/journal', label: 'Journal', icon: PenTool },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/analysis/insights', label: 'Insights', icon: BarChart3 },
  { href: '/analysis', label: 'Patterns', icon: Repeat2 },
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
      <aside className="absolute inset-y-0 left-0 flex w-[80%] max-w-[320px] animate-slide-in-left flex-col bg-surface pb-10 pt-8">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-5 top-7 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink-secondary text-ink-secondary"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-4 px-6 pb-7">
          <span className="h-12 w-12 rounded-full bg-primary-700/70" />
          <div>
            <p className="font-display text-[20px] font-bold text-ink-primary">
              Hey, {name}
            </p>
            <p className="text-[14px] text-primary-soft/70">mindthread user</p>
          </div>
        </div>

        <nav className="flex flex-col border-y border-line py-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'relative flex items-center gap-4 px-6 py-4 text-[18px] transition',
                  active
                    ? 'bg-primary/15 font-semibold text-ink-primary'
                    : 'text-ink-secondary hover:bg-white/5',
                )}
              >
                {active && (
                  <span className="absolute inset-y-0 left-0 w-1 bg-primary-soft" />
                )}
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                {active && (
                  <ChevronRight
                    className="h-5 w-5 text-fuchsia-400"
                    strokeWidth={2.5}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={signOut}
          className="mt-auto px-6 text-left text-[17px] font-semibold text-danger"
        >
          Sign out
        </button>
      </aside>
    </div>
  );
}
