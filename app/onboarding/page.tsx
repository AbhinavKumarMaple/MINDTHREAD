'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/layout/Screen';
import { TONES, APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { useOnboard } from '@/lib/query/hooks';
import type { Tone } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const onboard = useOnboard();
  const [tone, setTone] = useState<Tone | null>(null);

  async function choose(t: Tone) {
    setTone(t);
    try {
      await onboard.mutateAsync({ tone: t });
      router.replace('/journal');
    } catch {
      setTone(null);
    }
  }

  return (
    <Screen>
      <div className="flex min-h-full flex-col px-6 pb-12 pt-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-[0.18em]">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{APP_TAGLINE}</p>
        </div>
        <p className="mt-12 text-[15px] leading-relaxed text-ink-secondary">
          How should your AI respond to you? Choose a tone.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => choose(t.id)}
              disabled={onboard.isPending}
              className={cn(
                'rounded-2xl border p-4 text-left transition active:scale-[0.98] disabled:opacity-60',
                tone === t.id
                  ? 'border-primary bg-primary/10'
                  : 'border-line bg-surface',
              )}
            >
              <p className="font-display text-[15px] font-semibold text-ink-primary">
                {t.label}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                {t.blurb}
              </p>
            </button>
          ))}
        </div>
        {onboard.isError && (
          <p className="mt-4 text-sm text-danger">
            Could not save your choice. Please try again.
          </p>
        )}
        <p className="mt-auto pt-8 text-center text-xs text-ink-muted">
          You can change this anytime in Settings.
        </p>
      </div>
    </Screen>
  );
}
