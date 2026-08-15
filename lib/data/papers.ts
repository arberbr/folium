import { eq, inArray } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { analyses, paperCache } from "@/lib/db/schema";
import { getPaper, getPapersByIds } from "@/lib/arxiv/client";
import type { ArxivPaper } from "@/lib/arxiv/types";
import type { PaperBriefing } from "@/lib/ai/schema";
import { isFreshCache } from "@/lib/data/cache";
import { normalizeArxivId } from "@/lib/arxiv/ids";

export async function cachePaper(paper: ArxivPaper) {
  await ensureSchema();
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

export async function getCachedPaper(id: string): Promise<ArxivPaper | null> {
  await ensureSchema();
  const row = await db.query.paperCache.findFirst({
    where: eq(paperCache.arxivId, id),
  });
  if (row && isFreshCache(row.fetchedAt)) return row.payload;

  try {
    const paper = await getPaper(id);
    if (paper) await cachePaper(paper);
    return paper ?? row?.payload ?? null;
  } catch {
    return row?.payload ?? null;
  }
}

export async function getCachedPapersByIds(ids: string[]): Promise<ArxivPaper[]> {
  await ensureSchema();
  const unique = [...new Set(ids.filter(Boolean).map(normalizeArxivId))];
  if (!unique.length) return [];

  const rows = await db.query.paperCache.findMany({
    where: inArray(paperCache.arxivId, unique),
  });
  const byId = new Map(rows.map((row) => [row.arxivId, row.payload]));
  return unique
    .map((id) => byId.get(id))
    .filter((paper): paper is ArxivPaper => Boolean(paper));
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

export async function getCachedBriefing(arxivId: string) {
  await ensureSchema();
  return db.query.analyses.findFirst({
    where: eq(analyses.arxivId, arxivId),
  });
}

export async function saveBriefing(arxivId: string, briefing: PaperBriefing, model: string) {
  await ensureSchema();
  await db
    .insert(analyses)
    .values({
      arxivId,
      briefing,
      model,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: analyses.arxivId,
      set: { briefing, model, createdAt: new Date() },
    });
}
