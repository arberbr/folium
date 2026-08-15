import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Link from "next/link";
import { CollectionActions } from "@/components/collection-actions";
import { PaperCard } from "@/components/paper-card";
import { ControlButton } from "@/components/control-button";
import { papersByIdsWithFallback } from "@/lib/data/papers";
import { getCollectionBySlug } from "@/lib/data/user";

async function requestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return "";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth.protect();
  const { slug } = await params;
  const collection = await getCollectionBySlug(userId, decodeURIComponent(slug));
  return { title: collection?.name ?? "Collection" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth.protect();

  const { slug } = await params;
  const collection = await getCollectionBySlug(userId, decodeURIComponent(slug));

  if (!collection) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-4xl">This collection is missing</h1>
        <p className="text-muted-foreground">
          It may have been renamed, or it isn’t in your collections.
        </p>
        <ControlButton asChild>
          <Link href="/collections">Back to collections</Link>
        </ControlButton>
      </div>
    );
  }

  const [papers, origin] = await Promise.all([
    papersByIdsWithFallback(collection.paperIds),
    requestOrigin(),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-heading text-4xl sm:text-5xl">{collection.name}</h1>
          <CollectionActions
            collectionId={collection.id}
            name={collection.name}
            shareToken={collection.shareToken}
            origin={origin}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {papers.length} paper{papers.length === 1 ? "" : "s"}
        </p>
      </header>

      {papers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No papers in this collection yet. Open a paper and add it here.
        </p>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {papers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              collection={{ id: collection.id, name: collection.name }}
            />
          ))}
        </section>
      )}
    </div>
  );
}
