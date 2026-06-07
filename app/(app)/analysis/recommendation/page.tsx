'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, Check } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, SectionLabel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useAnalytics, useHabits, useCreateEntry } from '@/lib/query/hooks';

interface Reco {
  title: string;
  rationale: string;
  basedOn: number;
  why: string[];
  prompt: string;
}

function buildReco(
  peakHour: number | null,
  topEmotion: string | null,
  total: number,
): Reco {
  if (peakHour != null && (peakHour >= 22 || peakHour <= 3)) {
    return {
      title: 'Try journaling in the morning',
      rationale:
        'Your entries cluster late at night, when thoughts tend to spiral. A short morning entry can set a calmer tone for the day.',
      basedOn: total,
      why: ['Reduces late-night rumination', 'Sets a daily intention', 'Better emotional clarity'],
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
      rationale: `“${topEmotion}” shows up often in your entries. Naming a specific worry and one tiny next step makes it feel more manageable.`,
      basedOn: total,
      why: ['Externalizes the worry', 'Restores a sense of control', 'Turns feeling into action'],
      prompt:
        "What's weighing on you right now, and what's the smallest step you could take toward it?",
    };
  }
  return {
    title: 'Keep your reflection streak alive',
    rationale:
      'Consistency is where journaling pays off. A short, honest check-in today keeps the thread going.',
    basedOn: total,
    why: ['Builds a durable habit', 'Surfaces clearer patterns over time', 'Takes under two minutes'],
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
    <Screen header={<ScreenHeader title="For You" accent />}>
      <div className="space-y-5 px-5 pb-10">
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
            <Card className="border-primary/20 bg-primary/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-soft">
                A recommendation
              </p>
              <h1 className="mt-2 font-display text-[22px] font-bold leading-tight">
                {reco.title}
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
                {reco.rationale}
              </p>
              <p className="mt-3 text-xs text-ink-muted">
                Based on {reco.basedOn} entries analyzed
              </p>
            </Card>

            <div>
              <SectionLabel>Why this works</SectionLabel>
              <div className="space-y-2">
                {reco.why.map((w) => (
                  <div
                    key={w}
                    className="flex items-center gap-2.5 rounded-xl bg-surface px-3.5 py-3 text-sm text-ink-secondary"
                  >
                    <Check className="h-4 w-4 text-success" />
                    {w}
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-surface-raised">
              <SectionLabel>Try it now</SectionLabel>
              <p className="text-[15px] italic leading-relaxed text-ink-primary">
                “{reco.prompt}”
              </p>
            </Card>

            <div className="space-y-2.5">
              <Button
                fullWidth
                size="lg"
                onClick={startWriting}
                loading={create.isPending}
              >
                Start writing
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="secondary"
                onClick={() => setSnoozed(true)}
                disabled={snoozed}
              >
                {snoozed ? 'Reminder set for tomorrow' : 'Remind me tomorrow'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
