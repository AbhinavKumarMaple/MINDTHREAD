'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabProps {
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  label: string;
  className?: string;
  variant?: 'light' | 'primary';
}

export function Fab({
  href,
  onClick,
  icon,
  label,
  className,
  variant = 'light',
}: FabProps) {
  const inner = (
    <span
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-full shadow-fab transition active:scale-95',
        variant === 'light'
          ? 'border border-primary/40 bg-white text-bg-deep'
          : 'bg-primary text-white',
        className,
      )}
    >
      {icon ?? <Plus className="h-6 w-6" strokeWidth={2.5} />}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className="absolute bottom-4 right-5 z-30"
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="absolute bottom-4 right-5 z-30"
    >
      {inner}
    </button>
  );
}
