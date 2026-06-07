import { cn } from '@/lib/utils';

type Tone = 'processed' | 'processing' | 'draft' | 'concern' | 'neutral' | 'success';

const tones: Record<Tone, string> = {
  processed: 'bg-primary/15 text-primary-soft',
  processing: 'bg-ai/15 text-ai',
  draft: 'bg-surface-high text-ink-secondary',
  concern: 'bg-danger/15 text-danger',
  neutral: 'bg-surface-high text-ink-secondary',
  success: 'bg-success/15 text-success',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
