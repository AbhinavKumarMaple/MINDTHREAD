'use client';

import Link from 'next/link';
import { toneMeta } from '@/lib/constants';
import { TONE_ICONS } from '@/components/tone-icons';
import type { Tone } from '@/lib/types';

export function ToneChip({ tone }: { tone: Tone }) {
  const Icon = TONE_ICONS[tone];
  return (
    <Link
      href="/settings"
      className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[14px]"
    >
      <Icon className="h-4 w-4 text-ink-secondary" strokeWidth={1.75} />
      <span className="text-ink-primary">
        {toneMeta(tone).label.split(' ')[0]}
      </span>
      <span className="font-semibold text-primary-soft">Change</span>
    </Link>
  );
}
