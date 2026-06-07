'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useInsights, useRefreshInsights } from '@/lib/query/hooks';
import { ApiError } from '@/lib/api/client';

export default function InsightsPage() {
  const { data, isLoading } = useInsights();
  const refresh = useRefreshInsights();
  const [error, setError] = useState<string | null>(null);
  const insights = data?.insights ?? [];

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
        <ScreenHeader
          title="AI Insights"
          right={
            <button
              onClick={generate}
              disabled={refresh.isPending}
              aria-label="Refresh insights"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-high text-primary-soft"
            >
              <RefreshCw
                className={`h-4 w-4 ${refresh.isPending ? 'animate-spin' : ''}`}
              />
            </button>
          }
        />
      }
    >
      <div className="space-y-4 px-5 pb-10">
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}
        {isLoading ? (
          <LoadingState />
        ) : insights.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No insights yet"
            description="Generate AI insights across your entries to surface patterns about your timing, mood, and recurring themes."
            action={
              <Button onClick={generate} loading={refresh.isPending}>
                Generate insights
              </Button>
            }
          />
        ) : (
          <>
            {insights.map((i) => (
              <Card key={i.id} className="border-primary/20">
                <Sparkles className="mb-2 h-4 w-4 text-primary-soft" />
                <p className="text-[15px] leading-relaxed text-ink-primary">
                  {i.text}
                </p>
                {i.basedOn > 0 && (
                  <p className="mt-2 text-xs text-ink-muted">
                    Based on {i.basedOn} entries
                  </p>
                )}
              </Card>
            ))}
            <Button
              variant="secondary"
              fullWidth
              onClick={generate}
              loading={refresh.isPending}
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </>
        )}
      </div>
    </Screen>
  );
}
