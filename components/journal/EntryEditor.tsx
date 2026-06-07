'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Screen } from '../layout/Screen';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Button } from '../ui/Button';
import { useUpdateEntry, useProcessEntry } from '@/lib/query/hooks';
import { ApiError } from '@/lib/api/client';
import { formatDateLong } from '@/lib/utils';
import type { Entry } from '@/lib/types';

export function EntryEditor({ entry }: { entry: Entry }) {
  const [text, setText] = useState(entry.rawDump);
  const update = useUpdateEntry(entry.id);
  const process = useProcessEntry(entry.id);
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);

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
        <ScreenHeader
          title={formatDateLong(entry.createdAt)}
          right={
            <Button
              size="sm"
              variant="ai"
              onClick={runProcess}
              loading={processing}
            >
              {processing ? 'Processing' : 'Process'}
            </Button>
          }
        />
      }
    >
      <div className="flex min-h-full flex-col px-5 pb-8">
        <div className="flex items-center gap-2 pb-3 text-xs text-ink-muted">
          <span>Entry #{entry.entryNumber}</span>
        </div>

        {needsKey && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-ai/30 bg-ai/10 p-3 text-sm text-ai">
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
          <div className="mb-3 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Your dump
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          autoFocus
          placeholder="raw, unfiltered, no rules. just let it out…"
          className="min-h-[320px] flex-1 resize-none bg-transparent text-[16px] leading-relaxed text-ink-primary outline-none placeholder:text-ink-muted"
        />
      </div>
    </Screen>
  );
}
