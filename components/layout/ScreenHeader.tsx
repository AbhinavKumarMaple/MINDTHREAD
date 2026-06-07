'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IconButton } from '../ui/IconButton';
import { cn } from '@/lib/utils';

export function ScreenHeader({
  title,
  right,
  onBack,
  accent,
}: {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  accent?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between px-4 pb-3 pt-1">
      <IconButton
        onClick={onBack ?? (() => router.back())}
        aria-label="Back"
        className="bg-surface-high"
      >
        <ChevronLeft className="h-5 w-5" />
      </IconButton>
      {title && (
        <h1
          className={cn(
            'font-display text-[17px] font-semibold',
            accent && 'text-ai',
          )}
        >
          {title}
        </h1>
      )}
      <div className="flex min-w-[40px] items-center justify-end">{right}</div>
    </header>
  );
}
