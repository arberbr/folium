import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Link from "next/link";
import { CollectionActions } from "@/components/collection-actions";
import { ControlButton } from "@/components/control-button";
import { PaperCard } from "@/components/paper-card";
import { MissingPapersNotice, PaperGrid } from "@/components/paper-grid";
import { papersByIdsWithFallback } from "@/lib/data/papers";
import { getCollectionBySlug } from "@/lib/data/user";
import { pluralize } from "@/lib/format";
import { originFromForwarded } from "@/lib/http/origin";

async function requestOrigin() {
  const headerList = await headers();
  return originFromForwarded({
    host: headerList.get("x-forwarded-host") ?? headerList.get("host"),
    protocol: headerList.get("x-forwarded-proto"),
  });
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

  const missing = collection.paperIds.length - papers.length;

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
          {pluralize(collection.paperIds.length, "paper")}
        </p>
      </header>

      {collection.paperIds.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No papers in this collection yet. Open a paper and add it here.
        </p>
      ) : (
        <>
          <MissingPapersNotice missing={missing} />
          <PaperGrid>
            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                collection={{ id: collection.id, name: collection.name }}
              />
            ))}
          </PaperGrid>
        </>
      )}
    </div>
  );
}
