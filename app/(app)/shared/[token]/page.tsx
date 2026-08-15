import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { PaperCard } from "@/components/paper-card";
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
          {missing > 0 ? (
            <p className="text-sm text-muted-foreground">
              {missing} paper{missing === 1 ? "" : "s"} in this collection could not be loaded from
              arXiv right now.
            </p>
          ) : null}
          <section className="grid gap-5 md:grid-cols-2">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
