import { toPlainText } from "@/lib/arxiv/latex";
import type { ArxivPaper } from "@/lib/arxiv/types";

export function paperContext(paper: ArxivPaper) {
  return [
    `Title: ${toPlainText(paper.title)}`,
    `Authors: ${paper.authors.map((author) => author.name).join(", ")}`,
    `arXiv: ${paper.id}`,
    `Primary category: ${paper.primaryCategory}`,
    `Categories: ${paper.categories.join(", ")}`,
    `Published: ${paper.published}`,
    paper.comment ? `Comment: ${paper.comment}` : null,
    paper.journalRef ? `Journal: ${paper.journalRef}` : null,
    "",
    "Abstract:",
    toPlainText(paper.summary),
  ]
    .filter(Boolean)
    .join("\n");
}
