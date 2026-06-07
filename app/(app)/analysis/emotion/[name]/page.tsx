'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, SectionLabel } from '@/components/ui/Card';
import { BarMeter } from '@/components/analysis/charts';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { useEmotionDetail } from '@/lib/query/hooks';
import { emotionColor } from '@/lib/constants';
import { formatDayLabel } from '@/lib/utils';

export default function EmotionDetailPage() {
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
        <ScreenHeader
          title={name.charAt(0).toUpperCase() + name.slice(1)}
          accent
        />
      }
    >
      <div className="space-y-5 px-5 pb-10">
        {isLoading ? (
          <LoadingState />
        ) : !detail || detail.count === 0 ? (
          <EmptyState
            title="No data for this emotion"
            description="This emotion hasn't appeared in your processed entries yet."
          />
        ) : (
          <>
            <Card>
              <p
                className="font-display text-4xl font-bold"
                style={{ color }}
              >
                {detail.thisPeriodPct}%
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                of this month's entries
              </p>
              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <p className="text-ink-muted">This month</p>
                  <p className="font-semibold text-ink-primary">
                    {detail.thisPeriodPct}%
                  </p>
                </div>
                <div>
                  <p className="text-ink-muted">Last month</p>
                  <p className="font-semibold text-ink-primary">
                    {detail.prevPeriodPct}%
                  </p>
                </div>
              </div>
            </Card>

            {detail.triggers.length > 0 && (
              <Card>
                <SectionLabel>Triggered by</SectionLabel>
                <div className="space-y-3">
                  {detail.triggers.map((t) => (
                    <BarMeter
                      key={t.theme}
                      label={t.theme}
                      value={t.count}
                      max={maxTrigger}
                      color={color}
                      suffix=""
                    />
                  ))}
                </div>
              </Card>
            )}

            <div>
              <SectionLabel>Related entries</SectionLabel>
              <div className="space-y-2.5">
                {detail.relatedEntries.map((e) => (
                  <Link
                    key={e.id}
                    href={`/entry/${e.id}`}
                    className="block rounded-2xl border border-line bg-surface p-3.5"
                  >
                    <p className="text-[15px] text-ink-primary">
                      {e.title ?? 'Untitled'}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatDayLabel(e.createdAt)}
                    </p>
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
