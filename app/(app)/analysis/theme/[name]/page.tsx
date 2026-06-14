'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/ui/states';
import { DetailSkeleton } from '@/components/ui/skeletons';
import { useThemeDetail } from '@/lib/query/hooks';

const ACCENT = '#F59E0B';
const RELATED_COLORS = ['#EF4444', '#F59E0B', '#34D399', '#3B82F6', '#EC4899'];

function Sparkline({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  const w = 90;
  const h = 26;
  const step = counts.length > 1 ? w / (counts.length - 1) : w;
  const pts = counts.map(
    (c, i) => [i * step, h - 4 - (c / max) * (h - 8)] as const,
  );
  return (
    <div className="flex flex-col items-end gap-1">
      <svg width={w} height={h}>
        <polyline
          points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke={ACCENT}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill={ACCENT} />
        ))}
      </svg>
      <div className="flex w-[90px] justify-between text-[9px] text-ink-muted">
        {counts.map((_, i) => (
          <span key={i}>W{i + 1}</span>
        ))}
      </div>
    </div>
  );
}

export default function ThemeDetailPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const { data, isLoading } = useThemeDetail(name);
  const detail = data?.detail;

  const weekly = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    for (const e of detail?.entries ?? []) {
      const w = Math.min(3, Math.floor((new Date(e.createdAt).getDate() - 1) / 7));
      buckets[w] += 1;
    }
    return buckets;
  }, [detail]);

  const analysis = useMemo(() => {
    if (!detail || detail.count === 0) return null;
    const related = detail.relatedThemes[0];
    return related
      ? `${name.replace(/-/g, ' ')} appears in ${detail.count} of your entries, most often alongside ${related.replace(/-/g, ' ')}. Watch what tends to precede it.`
      : `${name.replace(/-/g, ' ')} appears in ${detail.count} of your entries this period.`;
  }, [detail, name]);

  return (
    <Screen
      header={
        <div className="flex items-center px-5 pb-6 pt-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-high text-ink-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 pr-12 text-center">
            <h1 className="inline-block font-display text-[20px] font-bold capitalize tracking-wide text-ink-primary">
              {name.replace(/-/g, ' ')}
              <span
                className="mx-auto mt-1 block h-[3px] w-10 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
            </h1>
          </div>
        </div>
      }
    >
      <div className="px-5 pb-10">
        {isLoading ? (
          <DetailSkeleton />
        ) : !detail || detail.count === 0 ? (
          <EmptyState
            title="No data for this theme"
            description="This theme hasn't appeared in your processed entries yet."
          />
        ) : (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5">
              <div>
                <p
                  className="font-display text-[24px] font-bold"
                  style={{ color: ACCENT }}
                >
                  {detail.count}{' '}
                  <span className="text-[20px]">
                    {detail.count === 1 ? 'entry' : 'entries'}
                  </span>
                </p>
                <p className="mt-1 text-[14px] text-ink-muted">
                  mention this theme
                </p>
              </div>
              <Sparkline counts={weekly} />
            </div>

            {analysis && (
              <>
                <p className="mb-3 mt-7 text-[13px] font-semibold text-ink-secondary">
                  AI Analysis
                </p>
                <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6">
                  <span className="absolute inset-y-0 left-0 w-[3px] bg-primary-soft" />
                  <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.15em] text-primary-soft">
                    <Sparkles className="h-3.5 w-3.5" fill="currentColor" /> AI
                    Insight
                  </p>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-ink-primary">
                    "{analysis}"
                  </p>
                </div>
              </>
            )}

            {detail.relatedThemes.length > 0 && (
              <>
                <p className="mb-3 mt-7 text-[13px] font-semibold text-ink-secondary">
                  Related Themes
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {detail.relatedThemes.map((t, i) => {
                    const color = RELATED_COLORS[i % RELATED_COLORS.length];
                    return (
                      <Link
                        key={t}
                        href={`/analysis/theme/${encodeURIComponent(t)}`}
                        className="rounded-full border px-4 py-1.5 text-[13px] font-medium capitalize"
                        style={{ borderColor: color, color }}
                      >
                        {t.replace(/-/g, ' ')}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            <p className="mb-3 mt-7 text-[13px] font-semibold text-ink-secondary">
              Mentioned Entries
            </p>
            <div className="space-y-3.5">
              {detail.entries.map((e) => (
                <Link
                  key={e.id}
                  href={`/entry/${e.id}`}
                  className="relative block overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-6"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ backgroundColor: ACCENT }}
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
                  {e.summary && (
                    <p className="mt-1.5 line-clamp-2 text-[14px] italic leading-relaxed text-ink-muted">
                      "{e.summary.slice(0, 90)}..."
                    </p>
                  )}
                </Link>
              ))}
            </div>

            <Link
              href="/chat"
              className="mt-8 block rounded-2xl border-[1.5px] border-primary-soft/70 py-4 text-center text-[16px] font-semibold text-primary-soft transition active:scale-[0.99]"
            >
              Ask AI about this →
            </Link>
          </>
        )}
      </div>
    </Screen>
  );
}
