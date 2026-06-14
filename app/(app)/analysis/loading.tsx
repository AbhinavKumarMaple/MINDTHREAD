import { SkeletonScreen, AnalysisSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <SkeletonScreen tabs>
      <div className="px-5 py-4">
        <AnalysisSkeleton />
      </div>
    </SkeletonScreen>
  );
}
