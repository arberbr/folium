import { PageHeaderSkeleton, PaperGridSkeleton } from "@/components/paper-skeletons";

export default function AppLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <PaperGridSkeleton count={4} />
    </div>
  );
}
