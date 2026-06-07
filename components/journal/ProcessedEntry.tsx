'use client';

import Link from 'next/link';
import { Sparkles, MessageCircle } from 'lucide-react';
import { Screen } from '../layout/Screen';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Badge } from '../ui/Badge';
import { Card, SectionLabel } from '../ui/Card';
import { EmotionTag } from './EmotionTag';
import { formatDateLong } from '@/lib/utils';
import type { Entry } from '@/lib/types';

export function ProcessedEntry({ entry }: { entry: Entry }) {
  const mood = entry.moodScore ?? 0;
  return (
    <Screen
      header={<ScreenHeader right={<Badge tone="processed">Processed</Badge>} />}
      floating={
        <Link
          href="/chat"
          aria-label="Ask AI"
          className="absolute bottom-5 right-5 z-30 flex h-11 items-center gap-1.5 rounded-full bg-ai px-4 text-sm font-semibold text-black shadow-glow active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </Link>
      }
    >
      <div className="space-y-5 px-5 pb-24">
        <div>
          <p className="text-xs text-ink-muted">
            {formatDateLong(entry.createdAt)} · Entry #{entry.entryNumber}
          </p>
          <h1 className="mt-1 font-display text-[26px] font-bold leading-tight">
            {entry.title}
          </h1>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <SectionLabel className="mb-0">Mood</SectionLabel>
            <span className="font-display text-lg font-bold text-primary-soft">
              {mood}/10
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-high">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ai to-primary"
              style={{ width: `${mood * 10}%` }}
            />
          </div>
          {entry.emotions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.emotions.map((e) => (
                <EmotionTag key={e} name={e} asLink />
              ))}
            </div>
          )}
        </Card>

        {entry.summary && (
          <div>
            <SectionLabel>Summary</SectionLabel>
            <p className="text-[15px] leading-relaxed text-ink-secondary">
              {entry.summary}
            </p>
          </div>
        )}

        {entry.reflectiveQuestion && (
          <Card className="border-primary/30 bg-primary/5">
            <div className="flex items-start gap-2.5">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-soft" />
              <div>
                <p className="text-[15px] italic leading-relaxed text-ink-primary">
                  “{entry.reflectiveQuestion}”
                </p>
                <Link
                  href="/chat"
                  className="mt-2 inline-block text-sm font-medium text-primary-soft"
                >
                  Explore this →
                </Link>
              </div>
            </div>
          </Card>
        )}

        {entry.themes.length > 0 && (
          <div>
            <SectionLabel>Themes</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {entry.themes.map((t) => (
                <Link
                  key={t}
                  href={`/analysis/theme/${encodeURIComponent(t)}`}
                  className="rounded-full bg-surface-high px-3 py-1.5 text-[13px] capitalize text-ink-secondary"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {entry.aiAnalysis && (
          <div>
            <SectionLabel>AI Analysis</SectionLabel>
            <p className="text-[15px] leading-relaxed text-ink-secondary">
              {entry.aiAnalysis}
            </p>
          </div>
        )}

        <Card className="border-line bg-surface-raised">
          <p className="text-sm text-ink-secondary">
            Any action items were added to your{' '}
            <Link href="/tasks" className="font-medium text-primary-soft">
              Tasks
            </Link>
            .
          </p>
        </Card>

        {entry.isConcern && (
          <Card className="border-ai/30 bg-ai/5">
            <p className="text-sm text-ai">
              This entry was gently flagged in your{' '}
              <Link href="/analysis/concerns" className="underline">
                Concern Tracker
              </Link>
              .
            </p>
          </Card>
        )}
      </div>
    </Screen>
  );
}
