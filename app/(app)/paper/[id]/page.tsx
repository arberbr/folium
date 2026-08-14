import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, FileText, Folder } from "lucide-react";
import { PaperGridSkeleton } from "@/components/paper-skeletons";
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
import { Latex } from "@/components/latex";
import { toPlainText } from "@/lib/arxiv/latex";
import type { ArxivPaper } from "@/lib/arxiv/types";
import { cachePaper, getCachedBriefing } from "@/lib/data/papers";
import { getCollections, getLibraryItem } from "@/lib/data/user";
import { formatAuthors, formatExactDate, collectionHref } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const paper = await getPaper(decodeURIComponent(id));
    // Document titles are plain text — LaTeX has to be flattened, not rendered.
    return { title: paper ? toPlainText(paper.title) : "Paper" };
  } catch {
    return { title: "Paper" };
  }
}

// Two more arXiv searches, and it sits below the fold — stream it so the paper
// itself is not held up by it, and degrade quietly when arXiv rate-limits us.
async function RelatedPapers({ paper }: { paper: ArxivPaper }) {
  let related: ArxivPaper[] = [];
  try {
    related = await relatedPapers(paper, 6);
  } catch {
    return (
      <p className="text-sm text-muted-foreground">
        arXiv did not return neighbours for this paper. Try again in a bit.
      </p>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {related.map((item) => (
        <PaperCard key={item.id} paper={item} compact />
      ))}
    </div>
  );
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;
  const arxivId = decodeURIComponent(id);

  let paper: ArxivPaper | null = null;
  try {
    paper = await getPaper(arxivId);
  } catch {
    paper = null;
  }

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

  const [libraryItem, cached, shelves] = await Promise.all([
    userId ? getLibraryItem(userId, paper.id) : Promise.resolve(undefined),
    getCachedBriefing(paper.id),
    userId ? getCollections(userId) : Promise.resolve([]),
    cachePaper(paper),
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
          <Latex>{paper.title}</Latex>
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
        <p className="mt-3 text-base leading-relaxed text-pretty">
          <Latex>{paper.summary}</Latex>
        </p>
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
        <Suspense fallback={<PaperGridSkeleton count={4} compact />}>
          <RelatedPapers paper={paper} />
        </Suspense>
      </section>
    </div>
  );
}
