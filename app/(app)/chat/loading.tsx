import { SkeletonScreen, ChatSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <SkeletonScreen>
      <div className="px-4 py-3">
        <ChatSkeleton />
      </div>
    </SkeletonScreen>
  );
}
