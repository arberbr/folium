import { PageHeaderSkeleton } from "@/components/paper-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocsLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton lines={2} />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
