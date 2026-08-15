import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/page-header";
import { PaperCard } from "@/components/paper-card";
import { MissingPapersNotice, PaperGrid } from "@/components/paper-grid";
import { papersByIdsWithFallback } from "@/lib/data/papers";
import { getLibrary } from "@/lib/data/user";
import { groupByReadingStatus } from "@/lib/reading-status";

export default async function LibraryPage() {
  const { userId } = await auth.protect();

  const items = await getLibrary(userId);
  const papers = await papersByIdsWithFallback(items.map((item) => item.arxivId));
  const byId = new Map(papers.map((paper) => [paper.id, paper]));
  const missing = items.filter((item) => !byId.has(item.arxivId)).length;
  const groups = groupByReadingStatus(items.filter((item) => byId.has(item.arxivId)));

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
          <MissingPapersNotice missing={missing} />
          {groups.map((group) => (
            <section key={group.status} className="space-y-4">
              <h2 className="font-heading text-2xl">{group.label}</h2>
              <PaperGrid>
                {group.items.map((item) => {
                  const paper = byId.get(item.arxivId);
                  if (!paper) return null;
                  return (
                    <PaperCard key={item.id} paper={paper} compact status={item.status} removable />
                  );
                })}
              </PaperGrid>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
