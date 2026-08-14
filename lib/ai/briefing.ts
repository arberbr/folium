import { toPlainText } from "@/lib/arxiv/latex";
import type { ArxivPaper } from "@/lib/arxiv/types";
import type { PaperBriefing } from "./schema";

function firstSentences(text: string, count: number) {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.slice(0, count).join(" ");
}

export function heuristicBriefing(paper: ArxivPaper): PaperBriefing {
  // Briefing strings render as plain text, so flatten the LaTeX here rather
  // than leaking `$\alpha$` into the TL;DR.
  const title = toPlainText(paper.title);
  const summary = toPlainText(paper.summary) || title;
  return {
    tldr: firstSentences(summary, 2) || title,
    audience: `Researchers working in ${paper.primaryCategory} and adjacent areas.`,
    claims: [
      `The paper addresses: ${title}.`,
      firstSentences(summary, 1) || "See the abstract for the primary claim.",
    ],
    methods: [
      "Method details are not extracted without an AI key — open the PDF or HTML version.",
      paper.comment ? `Author comment: ${paper.comment}` : "No author comment was provided on arXiv.",
    ],
    limitations: [
      "This is a heuristic briefing generated without a language model. Treat it as a sketch, not an analysis.",
    ],
    whyItMatters: `Newly listed under ${paper.primaryCategory}. Add an AI Gateway key to unlock a full Folium briefing.`,
    relatedQuestions: [
      "What is the strongest empirical result, and on which baseline?",
      "Which assumption would most change the conclusion if it failed?",
    ],
    difficulty: "graduate",
    novelty: 3,
  };
}

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
