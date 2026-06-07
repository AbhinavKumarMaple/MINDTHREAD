'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { toneMeta } from '@/lib/constants';
import type { Tone } from '@/lib/types';

export function ToneChip({ tone }: { tone: Tone }) {
  return (
    <Link
      href="/settings"
      className="flex items-center gap-1.5 rounded-full bg-surface-high px-3 py-1.5 text-[12px] text-ink-secondary"
    >
      <Sparkles className="h-3.5 w-3.5 text-ai" />
      <span className="font-medium text-ink-primary">
        {toneMeta(tone).label.split(' ')[0]}
      </span>
      <span className="text-ink-muted">Change</span>
    </Link>
  );
}
