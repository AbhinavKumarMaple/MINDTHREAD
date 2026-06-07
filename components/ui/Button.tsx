import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ai' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-600 shadow-glow-primary',
  secondary:
    'bg-surface-high text-ink-primary hover:brightness-110 border border-line',
  outline:
    'bg-transparent text-ink-primary border border-line hover:bg-surface-high',
  ghost: 'bg-transparent text-ink-secondary hover:text-ink-primary',
  ai: 'bg-ai text-black font-semibold shadow-glow hover:brightness-105',
  danger: 'bg-danger text-white hover:brightness-110',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl',
  md: 'h-11 px-4 text-[15px] rounded-2xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={loading || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
