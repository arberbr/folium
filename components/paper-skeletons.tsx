import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PaperCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="relative h-full bg-card/80">
      <CardContent className="relative flex h-full flex-col gap-3 px-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className={cn("h-5 w-full", compact && "h-4")} />
          <Skeleton className={cn("h-5 w-4/5", compact && "h-4")} />
        </div>
        <Skeleton className="h-3 w-2/3" />
        {compact ? null : (
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
          </div>
        )}
        <div className="mt-auto flex gap-2 pt-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PaperGridSkeleton({
  count = 6,
  compact = false,
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <PaperCardSkeleton key={index} compact={compact} />
      ))}
    </section>
  );
}

export function PageHeaderSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <header className="space-y-4">
      <Skeleton className="h-11 w-64 sm:h-12" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-4 w-72" />
      ))}
    </header>
  );
}
