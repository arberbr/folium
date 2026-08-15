import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/page-header";
import { PaperCard } from "@/components/paper-card";
import { papersByIdsWithFallback } from "@/lib/data/papers";
import { getLibrary } from "@/lib/data/user";

export default async function LibraryPage() {
  const { userId } = await auth.protect();

  const items = await getLibrary(userId);
  const papers = await papersByIdsWithFallback(items.map((item) => item.arxivId));
  const byId = new Map(papers.map((paper) => [paper.id, paper]));
  const missing = items.filter((item) => !byId.has(item.arxivId)).length;

  return (
    <div className="space-y-8">
      <PageHeader title="Library">
        <p className="text-muted-foreground">
          {items.length} paper{items.length === 1 ? "" : "s"}
        </p>
      </PageHeader>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Nothing saved yet. Start from Today or Explore.</p>
      ) : (
        <>
          {missing > 0 ? (
            <p className="text-sm text-muted-foreground">
              {missing} saved paper{missing === 1 ? "" : "s"} could not be loaded from arXiv right
              now.
            </p>
          ) : null}
          <section className="grid gap-5 md:grid-cols-2">
            {items.map((item) => {
              const paper = byId.get(item.arxivId);
              if (!paper) return null;
              return (
                <PaperCard key={item.id} paper={paper} compact status={item.status} removable />
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
