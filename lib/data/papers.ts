import { and, eq, inArray } from "drizzle-orm";
import type { PaperBriefing } from "@/lib/ai/schema";
import { getPaper, getPapersByIds } from "@/lib/arxiv/client";
import { normalizeArxivId } from "@/lib/arxiv/ids";
import type { ArxivPaper } from "@/lib/arxiv/types";
import { isFreshCache } from "@/lib/data/cache";
import { db } from "@/lib/db";
import { analyses, paperCache } from "@/lib/db/schema";

export async function cachePaper(paper: ArxivPaper) {
  await db
    .insert(paperCache)
    .values({
      arxivId: paper.id,
      payload: paper,
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: paperCache.arxivId,
      set: { payload: paper, fetchedAt: new Date() },
    });
}

/** Live-fetch on miss/stale; fall back to a stale row when arXiv is down. */
export async function loadPaper(id: string): Promise<ArxivPaper | null> {
  const arxivId = normalizeArxivId(id);
  const row = await db.query.paperCache.findFirst({
    where: eq(paperCache.arxivId, arxivId),
  });
  if (row && isFreshCache(row.fetchedAt)) return row.payload;

  try {
    const paper = await getPaper(arxivId);
    if (paper) await cachePaper(paper);
    return paper ?? row?.payload ?? null;
  } catch {
    return row?.payload ?? null;
  }
}

export async function getCachedPapersByIds(ids: string[]): Promise<ArxivPaper[]> {
  const unique = [...new Set(ids.filter(Boolean).map(normalizeArxivId))];
  if (!unique.length) return [];

  const rows = await db.query.paperCache.findMany({
    where: inArray(paperCache.arxivId, unique),
  });
  const byId = new Map(rows.map((row) => [row.arxivId, row.payload]));
  return unique.map((id) => byId.get(id)).filter((paper): paper is ArxivPaper => Boolean(paper));
}

/**
 * arXiv rate-limits hard and 503s under load. For pages whose paper list comes
 * from our own database, a stale local copy beats a 500. Live hits are written
 * through so the next outage has something to fall back to.
 */
export async function papersByIdsWithFallback(ids: string[]): Promise<ArxivPaper[]> {
  const unique = [...new Set(ids.filter(Boolean).map(normalizeArxivId))];
  if (!unique.length) return [];

  try {
    const papers = await getPapersByIds(unique);
    await Promise.all(papers.map((paper) => cachePaper(paper)));

    const found = new Set(papers.map((paper) => paper.id));
    const missing = unique.filter((id) => !found.has(id) && !found.has(id.replace(/v\d+$/, "")));
    if (!missing.length) return papers;

    const cached = await getCachedPapersByIds(missing);
    return [...papers, ...cached];
  } catch {
    return getCachedPapersByIds(unique);
  }
}

export async function getCachedBriefing(userId: string, arxivId: string, model: string) {
  return db.query.analyses.findFirst({
    where: and(
      eq(analyses.userId, userId),
      eq(analyses.arxivId, arxivId),
      eq(analyses.model, model),
    ),
  });
}

export async function saveBriefing(
  userId: string,
  arxivId: string,
  briefing: PaperBriefing,
  model: string,
) {
  await db
    .insert(analyses)
    .values({
      userId,
      arxivId,
      briefing,
      model,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [analyses.userId, analyses.arxivId, analyses.model],
      set: { briefing, createdAt: new Date() },
    });
}
