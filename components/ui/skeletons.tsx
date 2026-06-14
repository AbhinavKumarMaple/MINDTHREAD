import { Skeleton } from './states';

// Content-shaped loading placeholders. Shared between each page's in-flight
// fetch state and its route-level loading.tsx, so the shell appears instantly
// and data streams into a layout that matches the real content (no spinner, no
// jarring reflow when the data lands).

export function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 pb-1">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-11 w-11 rounded-full" />
    </div>
  );
}

export function TabBarSkeleton() {
  return (
    <div className="mt-3 flex border-b border-line/60">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 pb-3.5 pt-1 text-center">
          <Skeleton className="mx-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

// Mirrors the Screen layout so loading.tsx can stand in for a full page.
export function SkeletonScreen({
  tabs = false,
  children,
}: {
  tabs?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col bg-bg-base pt-3">
      <HeaderSkeleton />
      {tabs && <TabBarSkeleton />}
      <div className="relative min-h-0 flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}

export function EntryCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-surface-high" />
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3.5 w-2/3" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3.5">
        <span className="mt-1 h-12 w-1 shrink-0 rounded-full bg-surface-high" />
        <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-2.5 h-3.5 w-1/3" />
        </div>
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function EntryListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-40" />
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <EntryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-40" />
      <div className="space-y-3.5">
        {Array.from({ length: count }).map((_, i) => (
          <TaskRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <Skeleton className="h-7 w-12" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="rounded-2xl border border-line bg-surface p-5">
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="mb-1.5 flex justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
    </div>
  );
}

// Generic detail skeleton for the analysis sub-screens (mood, emotion, theme…).
export function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="space-y-3.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
      <Skeleton className="h-20 w-4/5 rounded-2xl" />
      <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
      <Skeleton className="h-16 w-3/4 rounded-2xl" />
    </div>
  );
}
