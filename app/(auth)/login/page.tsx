'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useLogin } from '@/lib/query/hooks';
import { ApiError } from '@/lib/api/client';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { user } = await login.mutateAsync({ email, password });
      router.replace(user.onboarded ? '/journal' : '/onboarding');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed');
    }
  }

  return (
    <Screen>
      <div className="flex min-h-full flex-col justify-center px-6 pb-12">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-bold tracking-[0.18em]">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{APP_TAGLINE}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={login.isPending}>
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-secondary">
          No account yet?{' '}
          <Link href="/signup" className="font-medium text-primary-soft">
            Create one
          </Link>
        </p>
      </div>
    </Screen>
  );
}
