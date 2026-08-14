import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ExternalLink, FileText, Folder } from "lucide-react";
import { AddToShelf } from "@/components/add-to-shelf";
import { PaperBriefingPanel } from "@/components/paper-briefing";
import { PaperCard } from "@/components/paper-card";
import { PaperChat } from "@/components/paper-chat";
import { SaveButton } from "@/components/save-button";
import { StatusToggle } from "@/components/status-toggle";
import { Chip, ChipGroup } from "@/components/chip";
import { ControlButton } from "@/components/control-button";
import { heuristicBriefing } from "@/lib/ai/briefing";
import { hasAiKey } from "@/lib/ai/models";
import { getPaper, relatedPapers } from "@/lib/arxiv/client";
import { categoryLabel } from "@/lib/arxiv/categories";
import { cachePaper, getCachedBriefing } from "@/lib/data/papers";
import { getCollections, getLibraryItem } from "@/lib/data/user";
import { formatAuthors, formatExactDate, collectionHref } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paper = await getPaper(decodeURIComponent(id));
  return {
    title: paper?.title ?? "Paper",
  };
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;
  const arxivId = decodeURIComponent(id);
  const paper = await getPaper(arxivId);

  if (!paper) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-4xl">This folio is missing</h1>
        <p className="text-muted-foreground">arXiv did not return {arxivId}.</p>
        <ControlButton asChild>
          <Link href="/explore">Back to explore</Link>
        </ControlButton>
      </div>
    );
  }

  await cachePaper(paper);

  const [libraryItem, cached, related, shelves] = await Promise.all([
    userId ? getLibraryItem(userId, paper.id) : Promise.resolve(undefined),
    getCachedBriefing(paper.id),
    relatedPapers(paper, 6),
    userId ? getCollections(userId) : Promise.resolve([]),
  ]);

  const briefing = cached?.briefing ?? heuristicBriefing(paper);
  const inCollections = shelves.filter((shelf) => shelf.paperIds.includes(paper.id));

  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono tracking-wide text-primary">{paper.id}</span>
          <span className="text-muted-foreground">{formatExactDate(paper.published)}</span>
          {paper.comment ? (
            <span className="text-muted-foreground">{paper.comment}</span>
          ) : null}
        </div>
        <h1 className="font-heading max-w-4xl text-4xl leading-tight text-pretty sm:text-5xl">
          {paper.title}
        </h1>
        <p className="max-w-3xl text-muted-foreground">{formatAuthors(paper.authors, 8)}</p>
        <ChipGroup>
          {paper.categories.map((category) => (
            <Chip key={category} asChild>
              <Link href={`/explore?cat=${encodeURIComponent(category)}`}>
                {categoryLabel(category)}
              </Link>
            </Chip>
          ))}
        </ChipGroup>
        <div className="flex flex-wrap items-center gap-2">
          <SaveButton arxivId={paper.id} saved={Boolean(libraryItem)} />
          <AddToShelf arxivId={paper.id} shelves={shelves} />
          <StatusToggle arxivId={paper.id} status={libraryItem?.status ?? null} />
          <ControlButton variant="outline" asChild>
            <a href={paper.absUrl} target="_blank" rel="noreferrer">
              <ExternalLink />
              arXiv
            </a>
          </ControlButton>
          <ControlButton variant="outline" asChild>
            <a href={paper.pdfUrl} target="_blank" rel="noreferrer">
              <FileText />
              PDF
            </a>
          </ControlButton>
        </div>
        {inCollections.length ? (
          <ChipGroup className="gap-2">
            {inCollections.map((shelf) => (
              <Chip key={shelf.id} asChild size="lg" variant="shelf">
                <Link href={collectionHref(shelf.slug)}>
                  <Folder className="size-3.5" />
                  {shelf.name}
                </Link>
              </Chip>
            ))}
          </ChipGroup>
        ) : null}
      </header>

      <section className="rounded-2xl border border-border/80 bg-card/40 p-6">
        <p className="text-xs tracking-[0.22em] text-primary uppercase">Abstract</p>
        <p className="mt-3 text-base leading-relaxed text-pretty">{paper.summary}</p>
      </section>

      <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <PaperBriefingPanel
          arxivId={paper.id}
          initial={briefing}
          canStream={hasAiKey()}
          cached={Boolean(cached)}
        />
        <PaperChat arxivId={paper.id} />
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-3xl">Nearby in the stack</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {related.map((item) => (
            <PaperCard key={item.id} paper={item} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
