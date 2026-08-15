import Link from "next/link";
import { Chip, ChipGroup } from "@/components/chip";
import { Latex } from "@/components/latex";
import { RemovePaperButton } from "@/components/remove-paper-button";
import { toPlainText } from "@/lib/arxiv/latex";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabel } from "@/lib/arxiv/categories";
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

function statusChipClass(status: ReadingStatus) {
  switch (status) {
    case "queued":
      return "border-amber-500/40 bg-amber-500/12 text-amber-800 before:bg-amber-500 hover:border-amber-500/55 hover:bg-amber-500/18 dark:text-amber-200";
    case "reading":
      return "border-sky-500/40 bg-sky-500/12 text-sky-800 before:bg-sky-500 hover:border-sky-500/55 hover:bg-sky-500/18 dark:text-sky-200";
    case "done":
      return "border-emerald-500/40 bg-emerald-500/12 text-emerald-800 before:bg-emerald-500 hover:border-emerald-500/55 hover:bg-emerald-500/18 dark:text-emerald-200";
    case "skipped":
      return "border-rose-400/40 bg-rose-400/12 text-rose-800 before:bg-rose-400 hover:border-rose-400/55 hover:bg-rose-400/18 dark:text-rose-300";
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
  return (
    <Card
      className={cn(
        "relative h-full bg-card/80 transition-transform duration-300 hover:-translate-y-0.5 hover:ring-primary/40",
        className,
      )}
    >
      <Link
        href={paperHref(paper.id)}
        className="absolute inset-0 z-0 rounded-[inherit]"
        aria-label={toPlainText(paper.title)}
      />
      <CardContent className="pointer-events-none relative z-10 flex h-full flex-col gap-3 px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-[11px] tracking-wide text-primary">{paper.id}</span>
            {status ? <Chip className={statusChipClass(status)}>{statusLabel(status)}</Chip> : null}
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
          <Latex>{paper.title}</Latex>
        </h3>
        <p className="text-sm text-muted-foreground">{formatAuthors(paper.authors)}</p>
        {!compact ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
            <Latex>{paper.summary}</Latex>
          </p>
        ) : null}
        <ChipGroup className="mt-auto pt-2">
          {paper.categories.slice(0, 3).map((category) => (
            <Chip key={category}>{categoryLabel(category)}</Chip>
          ))}
        </ChipGroup>
      </CardContent>
    </Card>
  );
}
