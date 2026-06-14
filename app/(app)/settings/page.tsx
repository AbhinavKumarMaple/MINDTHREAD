'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { DetailSkeleton } from '@/components/ui/skeletons';
import { ModelSelect } from '@/components/settings/ModelSelect';
import { TONE_ICONS } from '@/components/tone-icons';
import {
  useSettings,
  useUpdateSettings,
  useLogout,
} from '@/lib/query/hooks';
import { TONES } from '@/lib/constants';
import type { Tone } from '@/lib/types';
import { cn } from '@/lib/utils';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2.5 text-[14px] font-bold uppercase tracking-[0.22em] text-ink-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-primary" />
      {children}
    </p>
  );
}

function StripCard({
  accent,
  children,
  className,
}: {
  accent: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6',
        className,
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data, isLoading } = useSettings();
  const update = useUpdateSettings();
  const logout = useLogout();
  const user = data?.user;

  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('');
  const [savedField, setSavedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName);
      setModel(user.model ?? '');
    }
  }, [user]);

  function flash(field: string) {
    setSavedField(field);
    setTimeout(() => setSavedField(null), 1800);
  }

  async function setTone(tone: Tone) {
    await update.mutateAsync({ tone });
  }
  async function saveName() {
    if (!name.trim()) return;
    await update.mutateAsync({ displayName: name.trim() });
    flash('name');
  }
  async function saveKey() {
    await update.mutateAsync({ geminiApiKey: apiKey });
    setApiKey('');
    flash('key');
  }
  async function saveModel() {
    await update.mutateAsync({ model: model.trim() });
    flash('model');
  }
  async function signOut() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  if (isLoading || !user) {
    return (
      <Screen>
        <DetailSkeleton />
      </Screen>
    );
  }

  return (
    <Screen
      header={
        <div className="flex items-center gap-4 px-5 pb-5 pt-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-bg-deep transition active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <h1 className="font-display text-[24px] font-bold uppercase tracking-[0.22em] text-ink-primary">
            Settings
          </h1>
        </div>
      }
    >
      <div className="space-y-9 px-5 pb-12">
        <section>
          <SectionLabel>Tone</SectionLabel>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
            {TONES.map((t) => {
              const Icon = TONE_ICONS[t.id];
              const active = user.tone === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  disabled={update.isPending}
                  className={cn(
                    'relative w-[160px] shrink-0 rounded-2xl border p-4 text-left transition active:scale-[0.98] disabled:opacity-60',
                    active
                      ? 'border-primary-soft bg-primary/15'
                      : 'border-line bg-surface',
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-primary-soft/60 px-2 py-0.5 text-[10px] font-bold text-primary-soft">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  )}
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      active ? 'text-primary-soft' : 'text-ink-secondary',
                    )}
                    strokeWidth={1.5}
                  />
                  <p
                    className={cn(
                      'mt-4 text-[16px] font-semibold',
                      active ? 'text-primary-soft' : 'text-ink-primary',
                    )}
                  >
                    {t.label}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <SectionLabel>Gemini API Key</SectionLabel>
          <StripCard accent="#2DD4BF">
            <p className="text-[16px] leading-relaxed text-ink-muted">
              Your data is stored locally. An API key is required for AI
              processing features.
            </p>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={user.hasApiKey ? '••••••••••••••••••••••' : 'Paste your key'}
              className="mt-4 w-full rounded-xl border border-line bg-transparent px-4 py-3.5 text-[15px] tracking-widest text-ink-primary outline-none placeholder:text-ink-muted focus:border-primary"
            />
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowKey((s) => !s)}
                className="rounded-xl bg-surface-high py-3.5 text-[13px] font-bold uppercase tracking-[0.2em] text-primary-soft transition active:scale-[0.98]"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={saveKey}
                disabled={!apiKey.trim() || update.isPending}
                className="rounded-xl bg-primary-700 py-3.5 text-[13px] font-bold uppercase tracking-[0.2em] text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                {savedField === 'key' ? 'Saved ✓' : 'Save'}
              </button>
            </div>
            {user.hasApiKey && (
              <p className="mt-3 flex items-center gap-1 text-xs text-success">
                <Check className="h-3.5 w-3.5" /> A key is configured
              </p>
            )}
          </StripCard>
        </section>

        <section>
          <SectionLabel>AI Model</SectionLabel>
          <StripCard accent="#8B5CF6">
            <p className="mb-4 text-[16px] leading-relaxed text-ink-muted">
              Which model handles your AI processing, insights and chat.
            </p>
            <ModelSelect value={model} onChange={setModel} />
            <button
              onClick={saveModel}
              disabled={update.isPending}
              className="mt-4 w-full rounded-xl bg-surface-high py-3.5 text-[13px] font-bold uppercase tracking-[0.2em] text-primary-soft transition active:scale-[0.98] disabled:opacity-50"
            >
              {savedField === 'model' ? 'Saved ✓' : 'Save model'}
            </button>
          </StripCard>
        </section>

        <section>
          <SectionLabel>Profile</SectionLabel>
          <StripCard accent="#3B82F6">
            <div className="flex items-center gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="min-w-0 flex-1 rounded-xl border border-line bg-transparent px-4 py-3.5 text-[15px] text-ink-primary outline-none placeholder:text-ink-muted focus:border-primary"
              />
              <button
                onClick={saveName}
                disabled={update.isPending}
                className="shrink-0 rounded-xl bg-surface-high px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.2em] text-primary-soft transition active:scale-[0.98] disabled:opacity-50"
              >
                {savedField === 'name' ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </StripCard>
        </section>

        <section>
          <SectionLabel>About MindThread</SectionLabel>
          <StripCard accent="#F59E0B">
            <p className="text-[16px] leading-relaxed text-ink-muted">
              MindThread is your second mind. A sanctuary for raw thought,
              refined by artificial intelligence to uncover patterns and
              promote clarity.
            </p>
          </StripCard>
        </section>

        <button
          onClick={signOut}
          disabled={logout.isPending}
          className="w-full py-2 text-center text-[15px] font-semibold text-danger disabled:opacity-50"
        >
          Sign out
        </button>
      </div>
    </Screen>
  );
}
