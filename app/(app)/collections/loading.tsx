import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading text-4xl sm:text-5xl">Collections</h1>
        <Skeleton className="h-4 w-32" />
      </header>
      <section className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </section>
    </div>
  );
}
