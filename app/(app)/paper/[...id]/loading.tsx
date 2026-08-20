import { PaperGridSkeleton } from "@/components/paper-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaperLoading() {
  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="max-w-4xl space-y-3">
          <Skeleton className="h-10 w-full sm:h-12" />
          <Skeleton className="h-10 w-3/4 sm:h-12" />
        </div>
        <Skeleton className="h-4 w-2/3 max-w-3xl" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-6 w-28 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-md" />
          ))}
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-border/80 bg-card/40 p-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-3xl">Nearby in the stack</h2>
        <PaperGridSkeleton count={4} compact />
      </section>
    </div>
  );
}
