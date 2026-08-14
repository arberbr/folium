import { PaperGridSkeleton } from "@/components/paper-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading text-4xl sm:text-5xl">Library</h1>
        <Skeleton className="h-4 w-24" />
      </header>
      <PaperGridSkeleton count={6} compact />
    </div>
  );
}
