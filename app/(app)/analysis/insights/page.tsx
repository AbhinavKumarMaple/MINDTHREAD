'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, RefreshCw, Bookmark } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/states';
import { DetailSkeleton } from '@/components/ui/skeletons';
import { useInsights, useRefreshInsights } from '@/lib/query/hooks';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'week' | 'month' | 'pinned';

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(Date.now() - 86_400_000);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return 'Today';
  if (same(d, yest)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

const PIN_KEY = 'mt-pinned-insights';

export default function InsightsPage() {
  const router = useRouter();
  const { data, isLoading } = useInsights();
  const refresh = useRefreshInsights();
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    try {
      setPinned(JSON.parse(localStorage.getItem(PIN_KEY) ?? '[]'));
    } catch {
      setPinned([]);
    }
  }, []);

  function togglePin(id: string) {
    setPinned((prev) => {
      const next = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id];
      localStorage.setItem(PIN_KEY, JSON.stringify(next));
      return next;
    });
  }

  const insights = (data?.insights ?? []).filter((i) => {
    const age = Date.now() - +new Date(i.createdAt);
    if (filter === 'week') return age <= 7 * 86_400_000;
    if (filter === 'month') return age <= 31 * 86_400_000;
    if (filter === 'pinned') return pinned.includes(i.id);
    return true;
  });

  async function generate() {
    setError(null);
    try {
      await refresh.mutateAsync();
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === 'API_KEY_REQUIRED'
          ? 'Add your Gemini API key in Settings to generate insights.'
          : 'Could not generate insights. Try again.',
      );
    }
  }

  return (
    <Screen
      header={
        <>
          <div className="flex items-center px-5 pb-5 pt-2">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-high text-ink-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="flex-1 text-center font-display text-[22px] font-bold text-ink-primary">
              AI Insights
            </h1>
            <button
              onClick={generate}
              disabled={refresh.isPending}
              aria-label="Regenerate insights"
              className="flex h-12 w-12 items-center justify-center rounded-full text-primary-soft"
            >
              <RefreshCw
                className={cn('h-5 w-5', refresh.isPending && 'animate-spin')}
              />
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto px-5 pb-4 no-scrollbar">
            {(
              [
                ['all', 'All'],
                ['week', 'This Week'],
                ['month', 'This Month'],
                ['pinned', 'Pinned'],
              ] as [Filter, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={cn(
                  'shrink-0 rounded-full px-5 py-2 text-[14px] transition active:scale-95',
                  filter === k
                    ? 'bg-primary font-semibold text-white'
                    : 'bg-surface text-ink-secondary',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      }
    >
      <div className="space-y-4 px-5 pb-10">
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}
        {isLoading ? (
          <DetailSkeleton />
        ) : insights.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={filter === 'pinned' ? 'No pinned insights' : 'No insights yet'}
            description={
              filter === 'pinned'
                ? 'Tap the bookmark on an insight to pin it.'
                : 'Generate AI insights across your entries to surface patterns about your timing, mood, and recurring themes.'
            }
            action={
              filter !== 'pinned' ? (
                <Button onClick={generate} loading={refresh.isPending}>
                  Generate insights
                </Button>
              ) : undefined
            }
          />
        ) : (
          insights.map((i) => (
            <div
              key={i.id}
              className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6"
            >
              <span className="absolute inset-y-0 left-0 w-[3px] bg-primary-soft" />
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.15em] text-primary-soft">
                  <Sparkles className="h-3.5 w-3.5" fill="currentColor" /> AI
                  Insight
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-ink-muted">
                    {dateLabel(i.createdAt)}
                  </span>
                  <button
                    onClick={() => togglePin(i.id)}
                    aria-label="Pin insight"
                  >
                    <Bookmark
                      className={cn(
                        'h-4 w-4',
                        pinned.includes(i.id)
                          ? 'fill-primary-soft text-primary-soft'
                          : 'text-ink-muted',
                      )}
                    />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[17px] leading-relaxed text-ink-primary">
                “{i.text}”
              </p>
              <p className="mt-3 text-[13px] text-ink-muted">
                — Based on {i.basedOn} entries
              </p>
            </div>
          ))
        )}
      </div>
    </Screen>
  );
}
