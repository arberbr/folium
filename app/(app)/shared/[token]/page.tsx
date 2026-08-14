import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PaperCard } from "@/components/paper-card";
import { papersByIdsWithFallback } from "@/lib/data/papers";
import { getPublicCollectionByShareToken } from "@/lib/data/user";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
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

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-heading text-4xl sm:text-5xl">{collection.name}</h1>
        <p className="text-sm text-muted-foreground">
          {papers.length} paper{papers.length === 1 ? "" : "s"}
        </p>
      </header>

      {papers.length === 0 ? (
        <p className="text-sm text-muted-foreground">This collection has no papers yet.</p>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </section>
      )}
    </div>
  );
}
