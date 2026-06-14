'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/layout/Screen';
import { TONES, APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { TONE_ICONS } from '@/components/tone-icons';
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
      <div className="flex min-h-full flex-col px-5 pb-10">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 pt-10">
          <h1 className="text-center font-display text-[40px] font-bold leading-none tracking-[0.12em] text-ink-primary">
            {APP_NAME}
          </h1>
          <p className="text-center text-[15px] tracking-[0.3em] text-ink-muted">
            {APP_TAGLINE}
          </p>
        </div>

        <p className="px-2 text-center text-[20px] leading-snug text-ink-secondary">
          How should your AI respond to you? Choose a tone.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3.5">
          {TONES.map((t) => {
            const Icon = TONE_ICONS[t.id];
            return (
              <button
                key={t.id}
                onClick={() => choose(t.id)}
                disabled={onboard.isPending}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-4 pl-5 text-left transition active:scale-[0.98] disabled:opacity-60',
                  tone === t.id
                    ? 'border-primary bg-primary/10'
                    : 'border-line bg-surface',
                )}
              >
                <span
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ backgroundColor: t.accent }}
                />
                <Icon
                  className="h-7 w-7 text-ink-primary"
                  strokeWidth={1.5}
                />
                <p className="mt-5 font-display text-[17px] font-semibold text-ink-primary">
                  {t.label}
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">
                  {t.blurb}
                </p>
              </button>
            );
          })}
        </div>

        {onboard.isError && (
          <p className="mt-4 text-center text-sm text-danger">
            Could not save your choice. Please try again.
          </p>
        )}
        <div className="flex-1" />
      </div>
    </Screen>
  );
}
