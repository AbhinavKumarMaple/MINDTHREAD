import { SkeletonScreen, TaskListSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <SkeletonScreen tabs>
      <div className="px-5 py-3">
        <TaskListSkeleton />
      </div>
    </SkeletonScreen>
  );
}
