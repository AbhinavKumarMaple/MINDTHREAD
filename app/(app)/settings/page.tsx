'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, SectionLabel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { LoadingState } from '@/components/ui/states';
import {
  useSettings,
  useUpdateSettings,
  useLogout,
} from '@/lib/query/hooks';
import { TONES, APP_NAME } from '@/lib/constants';
import type { Tone } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { data, isLoading } = useSettings();
  const update = useUpdateSettings();
  const logout = useLogout();
  const user = data?.user;

  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) setName(user.displayName);
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
  async function signOut() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  if (isLoading || !user) {
    return (
      <Screen header={<ScreenHeader title="Settings" />}>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen header={<ScreenHeader title="Settings" />}>
      <div className="space-y-6 px-5 pb-10">
        <section>
          <SectionLabel>Tone</SectionLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                disabled={update.isPending}
                className={cn(
                  'rounded-2xl border p-3.5 text-left transition active:scale-[0.98]',
                  user.tone === t.id
                    ? 'border-primary bg-primary/10'
                    : 'border-line bg-surface',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-semibold text-ink-primary">
                    {t.label}
                  </p>
                  {user.tone === t.id && (
                    <Check className="h-4 w-4 text-primary-soft" />
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                  {t.blurb}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Profile</SectionLabel>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <Button
              variant="secondary"
              onClick={saveName}
              loading={update.isPending}
            >
              {savedField === 'name' ? 'Saved' : 'Save'}
            </Button>
          </div>
        </section>

        <section>
          <SectionLabel>Gemini API Key</SectionLabel>
          <Card>
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              Your journal is private to your account. A Gemini API key is
              required for AI processing, insights, and chat. It is encrypted
              before being stored.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    user.hasApiKey ? '•••••••••• (saved)' : 'Paste your key'
                  }
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-10 text-[15px] text-ink-primary outline-none placeholder:text-ink-muted focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  aria-label={showKey ? 'Hide' : 'Show'}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Button
                onClick={saveKey}
                loading={update.isPending}
                disabled={!apiKey.trim()}
              >
                {savedField === 'key' ? 'Saved' : 'Save'}
              </Button>
            </div>
            {user.hasApiKey && (
              <p className="mt-2 flex items-center gap-1 text-xs text-success">
                <Check className="h-3.5 w-3.5" /> A key is configured
              </p>
            )}
          </Card>
        </section>

        <section>
          <SectionLabel>About {APP_NAME}</SectionLabel>
          <Card className="bg-surface-raised">
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              {APP_NAME} is your second mind — a sanctuary for raw thought,
              refined by artificial intelligence to uncover patterns and
              promote clarity.
            </p>
          </Card>
        </section>

        <Button
          variant="ghost"
          fullWidth
          onClick={signOut}
          loading={logout.isPending}
          className="text-danger"
        >
          Sign out
        </Button>
      </div>
    </Screen>
  );
}
