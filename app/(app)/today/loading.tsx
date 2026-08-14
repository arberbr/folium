import { PaperGridSkeleton } from "@/components/paper-skeletons";

export default function TodayLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-heading text-4xl sm:text-5xl">Today</h1>
      </header>
      <PaperGridSkeleton count={8} />
    </div>
  );
}
