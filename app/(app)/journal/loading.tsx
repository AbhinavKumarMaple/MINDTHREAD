import { SkeletonScreen, EntryListSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <SkeletonScreen tabs>
      <div className="px-5 py-3">
        <EntryListSkeleton />
      </div>
    </SkeletonScreen>
  );
}
