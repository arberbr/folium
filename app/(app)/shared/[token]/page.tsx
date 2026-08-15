import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { PaperCard } from "@/components/paper-card";
import { MissingPapersNotice, PaperGrid } from "@/components/paper-grid";
import { papersByIdsWithFallback } from "@/lib/data/papers";
import { getPublicCollectionByShareToken } from "@/lib/data/user";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const collection = await getPublicCollectionByShareToken(decodeURIComponent(token));
  return { title: collection?.name ?? "Shared collection" };
}

export default async function SharedCollectionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // This is the one route with no request-time API of its own. Without this it
  // would be prerendered and serve a stale copy of the collection.
  await connection();

  const { token } = await params;
  const collection = await getPublicCollectionByShareToken(decodeURIComponent(token));

  if (!collection) notFound();

  const papers = await papersByIdsWithFallback(collection.paperIds);
  const missing = collection.paperIds.length - papers.length;

  return (
    <div className="space-y-8">
      <PageHeader title={collection.name}>
        <p className="text-sm text-muted-foreground">
          {collection.paperIds.length} paper{collection.paperIds.length === 1 ? "" : "s"}
        </p>
      </PageHeader>

      {collection.paperIds.length === 0 ? (
        <p className="text-sm text-muted-foreground">This collection has no papers yet.</p>
      ) : (
        <>
          <MissingPapersNotice missing={missing} />
          <PaperGrid>
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </PaperGrid>
        </>
      )}
    </div>
  );
}
