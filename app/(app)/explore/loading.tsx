import { PageHeaderSkeleton, PaperGridSkeleton } from "@/components/paper-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeaderSkeleton />
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <PaperGridSkeleton count={6} />
    </div>
  );
}
