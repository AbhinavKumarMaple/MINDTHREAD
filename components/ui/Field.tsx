import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <label className="block" htmlFor={id}>
        {label && (
          <span className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-ink-primary outline-none transition placeholder:text-ink-muted focus:border-primary',
            error && 'border-danger',
            className,
          )}
          {...props}
        />
        {error ? (
          <span className="mt-1 block text-xs text-danger">{error}</span>
        ) : hint ? (
          <span className="mt-1 block text-xs text-ink-muted">{hint}</span>
        ) : null}
      </label>
    );
  },
);
Field.displayName = 'Field';
