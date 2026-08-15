import Link from "next/link";
import { Chip, ChipGroup } from "@/components/chip";
import { Latex } from "@/components/latex";
import { RemovePaperButton } from "@/components/remove-paper-button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabel } from "@/lib/arxiv/categories";
import { toPlainText } from "@/lib/arxiv/latex";
import type { ArxivPaper } from "@/lib/arxiv/types";
import type { ReadingStatus } from "@/lib/db/schema";
import { formatAuthors, formatPublished, paperHref } from "@/lib/format";
import { cn } from "@/lib/utils";

function statusLabel(status: ReadingStatus) {
  switch (status) {
    case "queued":
      return "Queue";
    case "reading":
      return "Reading";
    case "done":
      return "Read";
    case "skipped":
      return "Skipped";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function PaperCard({
  paper,
  className,
  compact = false,
  status,
  removable = false,
  collection,
}: {
  paper: ArxivPaper;
  className?: string;
  compact?: boolean;
  status?: ReadingStatus;
  removable?: boolean;
  collection?: { id: string; name: string };
}) {
  const href = paperHref(paper.id);

  return (
    <Card
      className={cn(
        "h-full bg-card/80 transition-transform duration-300 hover:-translate-y-0.5 hover:ring-primary/40",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-[11px] tracking-wide text-primary">{paper.id}</span>
            {status ? <Chip variant={status}>{statusLabel(status)}</Chip> : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-[11px] text-muted-foreground">
              {formatPublished(paper.published)}
            </span>
            {collection ? (
              <RemovePaperButton
                arxivId={paper.id}
                title={toPlainText(paper.title)}
                collection={collection}
              />
            ) : removable ? (
              <RemovePaperButton arxivId={paper.id} title={toPlainText(paper.title)} />
            ) : null}
          </div>
        </div>
        <h3
          className={cn(
            "font-heading text-pretty text-foreground",
            compact ? "text-lg leading-snug" : "text-xl leading-snug",
          )}
        >
          <Link
            href={href}
            className="rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
          >
            <Latex>{paper.title}</Latex>
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{formatAuthors(paper.authors)}</p>
        {!compact ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
            <Latex>{paper.summary}</Latex>
          </p>
        ) : null}
        <ChipGroup className="mt-auto pt-2">
          {paper.categories.slice(0, 3).map((category) => (
            <Chip key={category} asChild>
              <Link href={`/explore?cat=${encodeURIComponent(category)}`}>
                {categoryLabel(category)}
              </Link>
            </Chip>
          ))}
        </ChipGroup>
      </CardContent>
    </Card>
  );
}
