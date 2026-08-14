import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { PaperCard } from "@/components/paper-card";
import { getPapersByIds } from "@/lib/arxiv/client";
import { createShelfAction } from "@/lib/actions";
import { getCollections, getLibrary } from "@/lib/data/user";
import { CreateShelfForm } from "@/components/create-shelf-form";
import { collectionHref } from "@/lib/format";

export default async function LibraryPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [items, shelves] = await Promise.all([
    getLibrary(userId),
    getCollections(userId),
  ]);
  const papers = await getPapersByIds(items.map((item) => item.arxivId));
  const byId = new Map(papers.map((paper) => [paper.id, paper]));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-heading text-4xl sm:text-5xl">Library</h1>
        <p className="text-muted-foreground">
          {items.length} folio{items.length === 1 ? "" : "s"} · {shelves.length} collection
          {shelves.length === 1 ? "" : "s"}
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl">Collections</h2>
          <CreateShelfForm action={createShelfAction} />
        </div>
        {shelves.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Name a collection after a question — “scaling laws”, “eval cheating”, “things to steal”.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {shelves.map((shelf) => (
              <Link key={shelf.id} href={collectionHref(shelf.slug)} className="block">
                <article className="rounded-2xl border border-border/80 bg-card/50 p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:ring-primary/40">
                  <h3 className="font-heading text-xl">{shelf.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {shelf.paperIds.length} paper{shelf.paperIds.length === 1 ? "" : "s"}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">All folios</h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground">Nothing saved yet. Start from Today or Explore.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {items.map((item) => {
              const paper = byId.get(item.arxivId);
              if (!paper) return null;
              return (
                <PaperCard
                  key={item.id}
                  paper={paper}
                  compact
                  status={item.status}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
