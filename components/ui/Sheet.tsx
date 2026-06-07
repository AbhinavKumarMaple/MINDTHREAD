'use client';

import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Sheet({ open, onClose, children, className, title }: SheetProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/60"
      />
      <div
        className={cn(
          'relative z-10 max-h-[90%] animate-slide-up overflow-y-auto rounded-t-3xl border-t border-line bg-surface px-5 pb-6 pt-3 no-scrollbar',
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
        {title && (
          <h2 className="mb-4 text-center font-display text-lg font-semibold">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
