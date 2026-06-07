'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, SectionLabel } from '@/components/ui/Card';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useThemeDetail } from '@/lib/query/hooks';
import { formatDayLabel } from '@/lib/utils';

export default function ThemeDetailPage() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const { data, isLoading } = useThemeDetail(name);
  const detail = data?.detail;

  return (
    <Screen
      header={
        <ScreenHeader
          title={name.charAt(0).toUpperCase() + name.slice(1)}
          accent
        />
      }
      floating={
        <Link
          href="/chat"
          className="absolute bottom-5 right-5 z-30 flex h-11 items-center gap-1.5 rounded-full bg-ai px-4 text-sm font-semibold text-black shadow-glow active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI about this
        </Link>
      }
    >
      <div className="space-y-5 px-5 pb-24">
        {isLoading ? (
          <LoadingState />
        ) : !detail || detail.count === 0 ? (
          <EmptyState
            title="No data for this theme"
            description="This theme hasn't appeared in your processed entries yet."
          />
        ) : (
          <>
            <Card>
              <p className="font-display text-3xl font-bold text-ink-primary">
                {detail.count}
                <span className="ml-2 text-base font-normal text-ink-muted">
                  {detail.count === 1 ? 'entry' : 'entries'}
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">mention this theme</p>
            </Card>

            {detail.relatedThemes.length > 0 && (
              <div>
                <SectionLabel>Related themes</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {detail.relatedThemes.map((t) => (
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

            <div>
              <SectionLabel>Mentioned across</SectionLabel>
              <div className="space-y-2.5">
                {detail.entries.map((e) => (
                  <Link
                    key={e.id}
                    href={`/entry/${e.id}`}
                    className="block rounded-2xl border border-line bg-surface p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-medium text-ink-primary">
                        {e.title ?? 'Untitled'}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatDayLabel(e.createdAt)}
                      </p>
                    </div>
                    {e.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">
                        {e.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
