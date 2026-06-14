'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Screen } from '../layout/Screen';
import { useTasks, useUpdateTask, useUpdateEntry } from '@/lib/query/hooks';
import { formatDateLong, formatTime, cn } from '@/lib/utils';
import { emotionColor, moodAccent } from '@/lib/constants';
import type { Entry, Task } from '@/lib/types';

const ACCENTS = {
  mood: '#8B5CF6',
  feeling: '#EC4899',
  ideas: '#EC4899',
  concern: '#F59E0B',
  patterns: '#8B5CF6',
  tasks: '#34D399',
  dump: '#F59E0B',
};

function Section({
  accent,
  label,
  badge,
  defaultOpen = true,
  children,
}: {
  accent: string;
  label: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span
          className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
          {label}
        </span>
        <span className="flex items-center gap-2">
          {badge}
          {open ? (
            <ChevronDown className="h-4 w-4 text-ink-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-ink-muted" />
          )}
        </span>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function PatternSection({ entry }: { entry: Entry }) {
  const update = useUpdateEntry(entry.id);
  const [tab, setTab] = useState<'what' | 'evidence' | 'advice' | 'history'>(
    'what',
  );
  const p = entry.pattern;
  if (!p) return null;
  const tabs = [
    ['what', 'What is it'],
    ['evidence', 'Evidence'],
    ['advice', 'Advice'],
    ['history', 'History'],
  ] as const;
  return (
    <Section
      accent={ACCENTS.patterns}
      label="Patterns"
      badge={
        p.needsAttention ? (
          <span className="rounded-full bg-danger/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-danger">
            Needs attention
          </span>
        ) : undefined
      }
    >
      <h3 className="font-display text-[22px] font-bold text-ink-primary">
        {p.name}
      </h3>
      <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition',
              tab === key
                ? 'bg-primary text-white'
                : 'bg-surface-high text-ink-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-surface-raised p-4">
        {tab === 'what' && (
          <p className="text-[15px] leading-relaxed text-ink-secondary">
            {p.whatIsIt || 'No description.'}
          </p>
        )}
        {tab === 'evidence' &&
          (p.evidence.length > 0 ? (
            <ul className="space-y-2">
              {p.evidence.map((e, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[15px] leading-relaxed text-ink-secondary"
                >
                  <span className="text-ink-muted">·</span> {e}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-ink-muted">No evidence noted.</p>
          ))}
        {tab === 'advice' && (
          <p className="text-[15px] leading-relaxed text-ink-secondary">
            {p.advice || 'No advice yet.'}
          </p>
        )}
        {tab === 'history' && (
          <p className="text-[15px] leading-relaxed text-ink-secondary">
            {p.tried
              ? 'You marked this pattern as tried. Keep noticing it.'
              : 'No history yet — try the advice and mark it below.'}
          </p>
        )}
      </div>
      <button
        onClick={() => update.mutate({ patternTried: true })}
        disabled={p.tried || update.isPending}
        className={cn(
          'mt-4 w-full rounded-xl py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] transition active:scale-[0.99]',
          p.tried
            ? 'bg-surface-high text-ink-muted'
            : 'bg-primary text-white shadow-glow-primary',
        )}
      >
        {p.tried ? 'Marked as tried ✓' : 'Mark as tried'}
      </button>
    </Section>
  );
}

function EntryTasks({ entry }: { entry: Entry }) {
  const { data } = useTasks();
  const update = useUpdateTask();
  const tasks = (data?.tasks ?? []).filter(
    (t) => t.sourceEntryId === entry.id,
  );
  if (tasks.length === 0) return null;
  return (
    <Section accent={ACCENTS.tasks} label="Tasks">
      <div className="space-y-3">
        {tasks.map((t: Task) => {
          const done = t.status === 'done';
          return (
            <button
              key={t.id}
              onClick={() =>
                update.mutate({ id: t.id, status: done ? 'pending' : 'done' })
              }
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition',
                  done
                    ? 'border-success bg-success text-white'
                    : 'border-ink-muted',
                )}
              >
                {done && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span
                className={cn(
                  'text-[16px]',
                  done ? 'text-ink-muted line-through' : 'text-ink-primary',
                )}
              >
                {t.title}
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

export function ProcessedEntry({ entry }: { entry: Entry }) {
  const router = useRouter();
  const mood = entry.moodScore ?? 0;
  const compositionWidths = [100, 68, 44, 30];
  return (
    <Screen
      header={
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="text-ink-primary"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <p className="text-[15px] font-semibold text-ink-primary">
                {formatDateLong(entry.createdAt)}
              </p>
              <p className="text-[12px] text-ink-muted">
                {formatTime(entry.createdAt)}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary-soft px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-bg-deep">
            Processed
          </span>
        </div>
      }
      floating={
        <Link
          href="/chat"
          aria-label="Ask AI"
          className="absolute right-5 top-[150px] z-30 flex h-11 items-center gap-1.5 rounded-full bg-ai px-4 text-[15px] font-bold text-black shadow-glow active:scale-95"
        >
          <Sparkles className="h-4 w-4" fill="currentColor" />
          AI
        </Link>
      }
    >
      <div className="space-y-4 px-5 pb-12">
        <div className="pr-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            Today's entry
          </p>
          <h1 className="mt-1.5 font-display text-[26px] font-bold leading-tight text-ink-primary">
            {entry.title}
          </h1>
        </div>

        <Section accent={ACCENTS.mood} label="Mood">
          <div className="flex items-start gap-5">
            <div className="flex items-center gap-3">
              <span className="font-display text-[44px] font-bold leading-none text-ink-primary">
                {Math.round(mood)}
              </span>
              <span
                className="h-11 w-11 rounded-full"
                style={{ backgroundColor: moodAccent(mood) }}
              />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                Mood composition
              </p>
              <div className="mt-2 space-y-2">
                {entry.emotions.slice(0, 4).map((e, i) => (
                  <div key={e} className="flex items-center gap-2.5">
                    <span
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${compositionWidths[i] ?? 25}%`,
                        maxWidth: '70%',
                        backgroundColor: emotionColor(e),
                      }}
                    />
                    <span className="text-[12px] capitalize text-ink-muted">
                      {e}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {entry.summary && (
            <p className="mt-4 rounded-xl bg-surface-raised p-4 text-[15px] leading-relaxed text-ink-secondary">
              {entry.summary}
            </p>
          )}
        </Section>

        {entry.feeling && (
          <Section accent={ACCENTS.feeling} label="Feeling" defaultOpen={false}>
            <p className="text-[15px] leading-relaxed text-ink-secondary">
              {entry.feeling}
            </p>
          </Section>
        )}

        {entry.ideas.length > 0 && (
          <Section
            accent={ACCENTS.ideas}
            label="Ideas"
            defaultOpen={false}
            badge={
              <span className="rounded-md bg-surface-high px-2 py-0.5 text-[11px] font-bold text-ink-secondary">
                {entry.ideas.length}
              </span>
            }
          >
            <ul className="space-y-2.5">
              {entry.ideas.map((idea, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[15px] leading-relaxed text-ink-secondary"
                >
                  <span className="text-primary-soft">•</span> {idea}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {entry.reflectiveQuestion && (
          <Section accent={ACCENTS.concern} label="Concern">
            <p className="font-display text-[20px] font-semibold leading-snug text-ink-primary">
              “{entry.reflectiveQuestion}”
            </p>
            <Link
              href="/chat"
              className="mt-4 inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-ai"
            >
              Explore with AI →
            </Link>
          </Section>
        )}

        <PatternSection entry={entry} />
        <EntryTasks entry={entry} />

        <Section accent={ACCENTS.dump} label="My dump">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
            {entry.rawDump}
          </p>
        </Section>

        {entry.themes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {entry.themes.map((t) => (
              <Link
                key={t}
                href={`/analysis/theme/${encodeURIComponent(t)}`}
                className="rounded-full bg-surface-high px-3.5 py-1.5 text-[13px] capitalize text-ink-secondary"
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
