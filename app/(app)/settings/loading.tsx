import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading max-w-3xl text-4xl leading-tight sm:text-5xl">Interests</h1>
      </header>
      <Skeleton className="h-11 w-full max-w-md rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 18 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-28 rounded-full" />
        ))}
      </div>
    </div>
  );
}
