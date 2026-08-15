import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { CreateShelfForm } from "@/components/create-shelf-form";
import { PageHeader } from "@/components/page-header";
import { createShelfAction } from "@/lib/actions";
import { getCollections } from "@/lib/data/user";
import { collectionHref } from "@/lib/format";

export const metadata = {
  title: "Collections",
};

export default async function CollectionsPage() {
  const { userId } = await auth.protect();

  const shelves = await getCollections(userId);

  return (
    <div className="space-y-8">
      <PageHeader title="Collections">
        <p className="text-muted-foreground">
          {shelves.length} collection{shelves.length === 1 ? "" : "s"}
        </p>
      </PageHeader>

      <section className="grid gap-3 md:grid-cols-3">
        <CreateShelfForm action={createShelfAction} />
        {shelves.map((shelf) => (
          <Link key={shelf.id} href={collectionHref(shelf.slug)} className="block">
            <article className="h-full rounded-2xl border border-border/80 bg-card/50 p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:ring-primary/40">
              <h2 className="font-heading text-xl">{shelf.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {shelf.paperIds.length} paper{shelf.paperIds.length === 1 ? "" : "s"}
              </p>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
