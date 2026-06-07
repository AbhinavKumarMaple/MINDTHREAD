'use client';

import Link from 'next/link';
import {
  Activity,
  ChevronRight,
  Sparkles,
  Lightbulb,
  ShieldAlert,
  LineChart,
  BarChart3,
} from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Card, SectionLabel } from '@/components/ui/Card';
import { StatCard, MoodChart, BarMeter } from '@/components/analysis/charts';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { useAnalytics } from '@/lib/query/hooks';
import { emotionColor } from '@/lib/constants';

const quickLinks = [
  { href: '/analysis/insights', label: 'AI Insights', icon: Sparkles },
  { href: '/analysis/habits', label: 'Habits', icon: BarChart3 },
  { href: '/analysis/concerns', label: 'Concerns', icon: ShieldAlert },
  {
    href: '/analysis/recommendation',
    label: 'For You',
    icon: Lightbulb,
  },
];

export default function AnalysisPage() {
  const { data, isLoading, isError, refetch } = useAnalytics();
  const summary = data?.summary;

  return (
    <Screen
      header={
        <>
          <AppHeader />
          <TabBar />
        </>
      }
    >
      <div className="space-y-5 px-4 py-4">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !summary || summary.processedEntries === 0 ? (
          <EmptyState
            icon={Activity}
            title="No analysis yet"
            description="Process a few journal entries and your mood trends, emotions, themes and insights will appear here."
          />
        ) : (
          <>
            <div className="flex gap-2.5">
              <StatCard value={summary.totalEntries} label="Entries" />
              <StatCard value={`${summary.streakDays}d`} label="Streak" />
              <StatCard
                value={summary.avgMood ?? '—'}
                label="Avg mood"
              />
            </div>

            <Link href="/analysis/mood" className="block">
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <SectionLabel className="mb-0 flex items-center gap-1.5">
                    <LineChart className="h-3.5 w-3.5" /> Mood Trend
                  </SectionLabel>
                  <ChevronRight className="h-4 w-4 text-ink-muted" />
                </div>
                <MoodChart data={summary.moodTrend} />
              </Card>
            </Link>

            {summary.topEmotions.length > 0 && (
              <Card>
                <SectionLabel>Top Emotions</SectionLabel>
                <div className="space-y-3">
                  {summary.topEmotions.slice(0, 4).map((e) => (
                    <Link
                      key={e.name}
                      href={`/analysis/emotion/${encodeURIComponent(e.name)}`}
                      className="block"
                    >
                      <BarMeter
                        label={e.name}
                        value={e.thisPeriodPct}
                        color={emotionColor(e.name)}
                      />
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {summary.topThemes.length > 0 && (
              <div>
                <SectionLabel>Recurring Themes</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {summary.topThemes.map((t) => (
                    <Link
                      key={t.name}
                      href={`/analysis/theme/${encodeURIComponent(t.name)}`}
                      className="rounded-full bg-surface-high px-3 py-1.5 text-[13px] capitalize text-ink-secondary"
                    >
                      {t.name}
                      <span className="ml-1.5 text-ink-muted">{t.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4"
                >
                  <Icon className="h-5 w-5 text-primary-soft" />
                  <span className="text-[14px] font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
