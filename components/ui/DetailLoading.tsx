import { Skeleton } from './states';
import { DetailSkeleton } from './skeletons';

// Route-level shell for back-header detail screens (settings, entry, analysis
// sub-pages). Renders instantly on navigation while the page's chunk + data load.
export default function DetailLoading() {
  return (
    <div className="relative flex h-full flex-col bg-bg-base pt-3">
      <div className="flex items-center gap-3 px-5 pb-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        <DetailSkeleton />
      </div>
    </div>
  );
}
