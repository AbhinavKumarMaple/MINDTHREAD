'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Moon, X, AlertCircle } from 'lucide-react';
import { Screen } from '../layout/Screen';
import { TONE_ICONS } from '../tone-icons';
import { useUpdateEntry, useProcessEntry, useMe } from '@/lib/query/hooks';
import { ApiError } from '@/lib/api/client';
import { formatDateLong, formatTime } from '@/lib/utils';
import { toneMeta } from '@/lib/constants';
import type { Entry } from '@/lib/types';

function lateNight(iso: string): boolean {
  const h = new Date(iso).getHours();
  return h >= 22 || h <= 4;
}

export function EntryEditor({ entry }: { entry: Entry }) {
  const router = useRouter();
  const me = useMe();
  const [text, setText] = useState(entry.rawDump);
  const update = useUpdateEntry(entry.id);
  const process = useProcessEntry(entry.id);
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const tone = me.data?.user?.tone ?? entry.toneUsed ?? 'warm';
  const ToneIcon = TONE_ICONS[tone];
  const showNudge = lateNight(entry.createdAt) && !nudgeDismissed;

  function save() {
    if (text !== entry.rawDump) update.mutate({ rawDump: text });
  }

  async function runProcess() {
    setError(null);
    setNeedsKey(false);
    if (!text.trim()) {
      setError('Write something before processing.');
      return;
    }
    try {
      if (text !== entry.rawDump) await update.mutateAsync({ rawDump: text });
      await process.mutateAsync({ rawDump: text });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'API_KEY_REQUIRED') {
        setNeedsKey(true);
      } else {
        setError(
          err instanceof ApiError ? err.message : 'Processing failed. Try again.',
        );
      }
    }
  }

  const processing = process.isPending || entry.status === 'processing';

  return (
    <Screen
      header={
        <div className="border-b border-line/60 px-5 pb-4 pt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-bg-deep transition active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[20px] font-bold text-ink-primary">
                {formatDateLong(entry.createdAt)}
              </p>
              <p className="text-[14px] text-ink-muted">
                {formatTime(entry.createdAt)}
              </p>
            </div>
            <button
              onClick={runProcess}
              disabled={processing}
              className="flex shrink-0 items-center gap-2 rounded-full border-[1.5px] border-primary-soft/70 bg-white/[0.03] px-5 py-3 text-[14px] font-bold uppercase tracking-[0.18em] text-ink-primary transition active:scale-95 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {processing ? 'Processing' : 'Process'}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex min-h-full flex-col px-5 pb-8 pt-4">
        <div className="flex items-center justify-between text-[16px]">
          <span className="text-ink-muted">Entry #{entry.entryNumber}</span>
          <span className="flex items-center gap-1.5 text-ink-muted">
            Tone: <ToneIcon className="h-4 w-4" strokeWidth={1.75} />{' '}
            {toneMeta(tone).label.split(' ')[0]}{' '}
            <Link href="/settings" className="font-semibold text-primary-soft">
              change
            </Link>
          </span>
        </div>

        {showNudge && (
          <div className="relative mt-4 rounded-2xl border-[1.5px] border-primary-soft/60 bg-primary/5 p-4 pl-5">
            <button
              onClick={() => setNudgeDismissed(true)}
              aria-label="Dismiss"
              className="absolute right-4 top-4 text-ink-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-3 pr-6">
              <Moon className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" />
              <p className="text-[16px] leading-relaxed text-ink-primary">
                Late night entry detected. Sleep timing may be connected to
                emotional state.
              </p>
            </div>
            <button
              onClick={() => {
                setReminderSet(true);
                setTimeout(() => setNudgeDismissed(true), 900);
              }}
              className="mt-3 text-[13px] font-bold uppercase tracking-[0.18em] text-primary-soft"
            >
              {reminderSet ? 'Reminder set ✓' : 'Set wind-down reminder'}
            </button>
          </div>
        )}

        {needsKey && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-ai/30 bg-ai/10 p-3 text-sm text-ai">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              A Gemini API key is required for AI processing.{' '}
              <Link href="/settings" className="font-medium underline">
                Add it in Settings
              </Link>
              .
            </span>
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line/70" />
          <span className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.22em] text-primary-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-soft" /> Your
            dump
          </span>
          <span className="h-px flex-1 bg-line/70" />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          autoFocus
          placeholder="write freely. new line per thought. no rules."
          className="mt-5 min-h-[320px] flex-1 resize-none bg-transparent text-[20px] leading-relaxed text-ink-secondary outline-none placeholder:text-ink-muted/60"
        />
      </div>
    </Screen>
  );
}
