'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { fetchAvailableModels, type AvailableModel } from '@/lib/ai/models';
import { getGeminiKey } from '@/lib/local/profile';
import { COMMON_MODELS, DEFAULT_MODEL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelect({ value, onChange }: Props) {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const key = await getGeminiKey();
      if (!key) {
        setError('Add your API key above to load your available models.');
        return;
      }
      const list = await fetchAvailableModels(key);
      setModels(list);
      setLoaded(true);
      if (list.length === 0) {
        setError('No text models were returned for this key.');
      }
    } catch {
      setError('Could not fetch models — you can still type a model name.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ids = models.length > 0 ? models.map((m) => m.id) : COMMON_MODELS;
  const dropdownValue = ids.includes(value) ? value : '';

  return (
    <div className="space-y-2">
      {/* Dropdown of available models */}
      <div className="relative">
        <select
          value={dropdownValue}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
          }}
          className="w-full appearance-none rounded-xl border border-line bg-surface px-4 py-3 pr-9 text-[15px] text-ink-primary outline-none focus:border-primary"
        >
          <option value="">
            {loading ? 'Loading models…' : 'Choose from available models…'}
          </option>
          {ids.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      </div>

      {/* Free-text input for a custom model name */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`${DEFAULT_MODEL} (default)`}
        spellCheck={false}
        autoCapitalize="off"
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 font-mono text-[13px] text-ink-primary outline-none placeholder:text-ink-muted focus:border-primary"
      />

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-muted">
          {error
            ? error
            : loaded
              ? `${models.length} models available · default: ${DEFAULT_MODEL}`
              : `Default: ${DEFAULT_MODEL}`}
        </span>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex shrink-0 items-center gap-1 text-primary-soft disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Reload
        </button>
      </div>
    </div>
  );
}
