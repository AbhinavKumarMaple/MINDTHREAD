'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useSignup } from '@/lib/query/hooks';
import { ApiError } from '@/lib/api/client';
import { APP_NAME } from '@/lib/constants';

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signup.mutateAsync({
        email,
        password,
        displayName: displayName || undefined,
      });
      router.replace('/onboarding');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed');
    }
  }

  return (
    <Screen>
      <div className="flex min-h-full flex-col justify-center px-6 pb-12">
        <div className="mb-9 text-center">
          <h1 className="font-display text-3xl font-bold tracking-[0.18em]">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Create your second mind.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
            autoComplete="name"
          />
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={signup.isPending}>
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-soft">
            Sign in
          </Link>
        </p>
      </div>
    </Screen>
  );
}
