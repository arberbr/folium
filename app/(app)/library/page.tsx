import { auth } from "@clerk/nextjs/server";
import { PaperCard } from "@/components/paper-card";
import { getPapersByIds } from "@/lib/arxiv/client";
import { getLibrary } from "@/lib/data/user";

export default async function LibraryPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const items = await getLibrary(userId);
  const papers = await getPapersByIds(items.map((item) => item.arxivId));
  const byId = new Map(papers.map((paper) => [paper.id, paper]));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading text-4xl sm:text-5xl">Library</h1>
        <p className="text-muted-foreground">
          {items.length} paper{items.length === 1 ? "" : "s"}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Nothing saved yet. Start from Today or Explore.</p>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {items.map((item) => {
            const paper = byId.get(item.arxivId);
            if (!paper) return null;
            return (
              <PaperCard
                key={item.id}
                paper={paper}
                compact
                status={item.status}
                removable
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
