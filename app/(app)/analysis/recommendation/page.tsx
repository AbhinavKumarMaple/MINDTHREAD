'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lightbulb, Bookmark } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useAnalytics, useHabits, useCreateEntry } from '@/lib/query/hooks';

interface Reco {
  title: string;
  rationale: string;
  basedOn: number;
  why: { title: string; sub: string; accent: string }[];
  promptLabel: string;
  prompt: string;
}

function buildReco(
  peakHour: number | null,
  topEmotion: string | null,
  total: number,
): Reco {
  if (peakHour != null && (peakHour >= 21 || peakHour <= 4)) {
    return {
      title: 'Try journaling in the morning',
      rationale:
        'Your evening entries show higher anxiety patterns. Morning journaling can help set a calmer tone for the day.',
      basedOn: total,
      why: [
        {
          title: 'Reduces anxiety',
          sub: 'Lower cortisol levels recorded in morning entries.',
          accent: '#34D399',
        },
        {
          title: 'Sets daily intention',
          sub: 'Prime your brain to notice positive opportunities.',
          accent: '#3B82F6',
        },
        {
          title: 'Better emotional clarity',
          sub: 'Process sleep-thoughts while they are still fresh.',
          accent: '#EC4899',
        },
      ],
      promptLabel: 'Morning Journal Prompt',
      prompt:
        "What's one thing you're looking forward to today, and what might hold you back?",
    };
  }
  if (
    topEmotion &&
    ['anxious', 'overwhelmed', 'frustrated'].includes(topEmotion)
  ) {
    return {
      title: 'Name the worry, then one small step',
      rationale: `"${topEmotion}" shows up often in your entries. Naming a specific worry and one tiny next step makes it feel more manageable.`,
      basedOn: total,
      why: [
        {
          title: 'Externalizes the worry',
          sub: 'Writing it down moves it out of the loop in your head.',
          accent: '#34D399',
        },
        {
          title: 'Restores control',
          sub: 'One small step turns dread into a to-do.',
          accent: '#3B82F6',
        },
        {
          title: 'Builds momentum',
          sub: 'Tiny wins compound across the week.',
          accent: '#EC4899',
        },
      ],
      promptLabel: 'Worry Journal Prompt',
      prompt:
        "What's weighing on you right now, and what's the smallest step you could take toward it?",
    };
  }
  return {
    title: 'Keep your reflection streak alive',
    rationale:
      'Consistency is where journaling pays off. A short, honest check-in today keeps the thread going.',
    basedOn: total,
    why: [
      {
        title: 'Builds a durable habit',
        sub: 'Daily check-ins lower the activation energy to write.',
        accent: '#34D399',
      },
      {
        title: 'Clearer patterns',
        sub: 'More entries give the AI better signal over time.',
        accent: '#3B82F6',
      },
      {
        title: 'Takes two minutes',
        sub: 'A few honest lines are enough.',
        accent: '#EC4899',
      },
    ],
    promptLabel: 'Daily Journal Prompt',
    prompt: 'How are you, really, in this exact moment?',
  };
}

export default function RecommendationPage() {
  const router = useRouter();
  const analytics = useAnalytics();
  const habits = useHabits();
  const create = useCreateEntry();
  const [snoozed, setSnoozed] = useState(false);

  const loading = analytics.isLoading || habits.isLoading;
  const summary = analytics.data?.summary;
  const h = habits.data?.habits;

  const reco = useMemo<Reco | null>(() => {
    if (!summary || summary.processedEntries === 0) return null;
    const peakHour = h
      ? h.writingHours.indexOf(Math.max(...h.writingHours))
      : null;
    const topEmotion = summary.topEmotions[0]?.name ?? null;
    return buildReco(peakHour, topEmotion, summary.processedEntries);
  }, [summary, h]);

  async function startWriting() {
    const { entry } = await create.mutateAsync({ rawDump: '' });
    router.push(`/entry/${entry.id}`);
  }

  return (
    <Screen
      header={
        <div className="flex items-center px-5 pb-5 pt-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="text-ink-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-bold uppercase tracking-[0.25em] text-ink-primary">
            For You
          </h1>
          <Bookmark className="h-5 w-5 text-ink-muted" />
        </div>
      }
    >
      <div className="px-5 pb-10">
        {loading ? (
          <LoadingState />
        ) : !reco ? (
          <EmptyState
            icon={Lightbulb}
            title="No recommendation yet"
            description="Process a few entries and a personalized recommendation will appear here."
          />
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6">
              <span className="absolute inset-y-0 left-0 w-[3px] bg-primary-soft" />
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-soft">
                <Lightbulb className="h-3.5 w-3.5" /> AI Recommendation
              </p>
              <h2 className="mt-2 font-display text-[22px] font-bold leading-tight text-ink-primary">
                {reco.title}
              </h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-secondary">
                {reco.rationale}
              </p>
              <p className="mt-3 text-[13px] text-ink-muted">
                — Based on {reco.basedOn} entries analysed
              </p>
            </div>

            <p className="mb-3 mt-8 text-[12px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
              Why this works
            </p>
            <div className="space-y-3.5">
              {reco.why.map((w) => (
                <div
                  key={w.title}
                  className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-6"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: w.accent }}
                  />
                  <p className="text-[16px] font-bold text-ink-primary">
                    {w.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                    {w.sub}
                  </p>
                </div>
              ))}
            </div>

            <p className="mb-3 mt-8 text-[12px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
              Try it now
            </p>
            <div className="rounded-2xl bg-primary p-5">
              <p className="text-[12px] font-semibold text-white/80">
                {reco.promptLabel}
              </p>
              <p className="mt-2 font-display text-[20px] font-bold italic leading-snug text-white">
                “{reco.prompt}”
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={startWriting}
                disabled={create.isPending}
                className="w-full rounded-2xl bg-primary-soft py-4 text-center text-[17px] font-bold text-bg-deep transition active:scale-[0.99] disabled:opacity-60"
              >
                Start Writing
              </button>
              <button
                onClick={() => setSnoozed(true)}
                disabled={snoozed}
                className="w-full rounded-2xl border border-line bg-surface py-4 text-center text-[17px] font-semibold text-ink-secondary transition active:scale-[0.99] disabled:opacity-60"
              >
                {snoozed ? 'Reminder set for tomorrow' : 'Remind me tomorrow'}
              </button>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
