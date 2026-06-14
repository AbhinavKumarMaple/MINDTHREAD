'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/ui/states';
import { DetailSkeleton } from '@/components/ui/skeletons';
import { useEmotionDetail } from '@/lib/query/hooks';
import { emotionColor } from '@/lib/constants';

export default function EmotionDetailPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const { data, isLoading } = useEmotionDetail(name);
  const detail = data?.detail;
  const color = emotionColor(name);
  const maxTrigger = detail
    ? Math.max(1, ...detail.triggers.map((t) => t.count))
    : 1;

  return (
    <Screen
      header={
        <div className="flex items-center px-5 pb-6 pt-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="text-ink-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1
            className="flex-1 pr-6 text-center font-display text-[22px] font-bold capitalize"
            style={{ color }}
          >
            {name}
          </h1>
        </div>
      }
    >
      <div className="px-5 pb-10">
        {isLoading ? (
          <DetailSkeleton />
        ) : !detail || detail.count === 0 ? (
          <EmptyState
            title="No data for this emotion"
            description="This emotion hasn't appeared in your processed entries yet."
          />
        ) : (
          <>
            <div className="rounded-3xl border border-line bg-surface p-6">
              <p
                className="font-display text-[44px] font-bold leading-none"
                style={{ color }}
              >
                {detail.thisPeriodPct}%
              </p>
              <p className="mt-2 text-[16px] text-ink-muted">
                of this month's entries
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-[14px]">
                    <span className="font-semibold text-ink-primary">
                      This month
                    </span>
                    <span className="font-bold" style={{ color }}>
                      {detail.thisPeriodPct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${detail.thisPeriodPct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-[14px]">
                    <span className="text-ink-muted">Last month</span>
                    <span className="text-ink-muted">
                      {detail.prevPeriodPct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-ink-muted/60"
                      style={{ width: `${detail.prevPeriodPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {detail.triggers.length > 0 && (
              <>
                <p className="mb-3 mt-7 text-[12px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
                  Triggered by
                </p>
                <div className="space-y-3.5">
                  {detail.triggers.map((t) => (
                    <Link
                      key={t.theme}
                      href={`/analysis/theme/${encodeURIComponent(t.theme)}`}
                      className="flex items-center gap-4 rounded-2xl bg-surface p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[17px] font-semibold capitalize text-ink-primary">
                          {t.theme.replace(/-/g, ' ')}
                        </p>
                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-black/40">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(t.count / maxTrigger) * 100}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-ink-muted" />
                    </Link>
                  ))}
                </div>
              </>
            )}

            <p className="mb-3 mt-7 text-[12px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
              Related entries
            </p>
            <div className="space-y-3.5">
              {detail.relatedEntries.slice(0, 3).map((e) => (
                <Link
                  key={e.id}
                  href={`/entry/${e.id}`}
                  className="relative block overflow-hidden rounded-2xl bg-surface p-4 pl-6"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[17px] font-semibold text-ink-primary">
                      {e.title ?? 'Untitled'}
                    </p>
                    <p className="shrink-0 text-[13px] text-ink-muted">
                      {new Date(e.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[14px] italic leading-relaxed text-ink-muted">
                    "{e.excerpt}..."
                  </p>
                </Link>
              ))}
            </div>

            {detail.relatedEntries.length > 0 && (
              <Link
                href="/journal"
                className="mt-6 block text-center text-[15px] font-semibold text-primary-soft"
              >
                View all {detail.relatedEntries.length}{' '}
                {detail.relatedEntries.length === 1 ? 'entry' : 'entries'} →
              </Link>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
