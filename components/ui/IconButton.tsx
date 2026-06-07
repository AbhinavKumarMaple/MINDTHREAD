import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full text-ink-secondary transition hover:bg-white/5 hover:text-ink-primary active:scale-95',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = 'IconButton';
