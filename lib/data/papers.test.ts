import { beforeAll, describe, expect, it, vi } from "vitest";
import type { PaperBriefing } from "@/lib/ai/schema";
import type { ArxivPaper } from "@/lib/arxiv/types";
import { PAPER_CACHE_TTL_MS } from "@/lib/data/cache";

vi.hoisted(() => {
  process.env.TURSO_DATABASE_URL = `file:./data/vitest-${crypto.randomUUID()}.db`;
});

const getPaper = vi.fn();

vi.mock("@/lib/arxiv/client", () => ({
  getPaper: (...args: unknown[]) => getPaper(...args),
  getPapersByIds: vi.fn(),
}));

import { cachePaper, getCachedBriefing, loadPaper, saveBriefing } from "@/lib/data/papers";
import { db, ready } from "@/lib/db";
import { paperCache } from "@/lib/db/schema";

const paper: ArxivPaper = {
  id: "1706.03762",
  version: "v5",
  title: "Attention Is All You Need",
  summary: "We propose the Transformer.",
  authors: [{ name: "Ashish Vaswani" }],
  categories: ["cs.CL"],
  primaryCategory: "cs.CL",
  published: "2017-06-12T17:57:34Z",
  updated: "2023-08-02T00:00:00Z",
  pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
  absUrl: "https://arxiv.org/abs/1706.03762",
  htmlUrl: "https://ar5iv.labs.arxiv.org/html/1706.03762",
};

const briefing: PaperBriefing = {
  tldr: "The Transformer replaces recurrence with attention.",
  audience: "NLP researchers.",
  claims: ["Attention suffices for transduction.", "The model trains faster."],
  methods: ["Multi-head attention", "Positional encodings"],
  limitations: ["Abstract-only sketch."],
  whyItMatters: "It is the template for later language models.",
  relatedQuestions: ["What is the strongest BLEU gain?", "Which assumption would break it?"],
  difficulty: "graduate",
  novelty: 5,
};

beforeAll(async () => {
  await ready();
});

describe("loadPaper", () => {
  it("returns a fresh cache without hitting arXiv", async () => {
    await cachePaper(paper);
    getPaper.mockClear();

    await expect(loadPaper(paper.id)).resolves.toEqual(paper);
    expect(getPaper).not.toHaveBeenCalled();
  });

  it("fetches on a cache miss and stores the result", async () => {
    getPaper.mockResolvedValueOnce({ ...paper, id: "1810.04805" });
    const loaded = await loadPaper("1810.04805");
    expect(loaded?.id).toBe("1810.04805");
    expect(getPaper).toHaveBeenCalledWith("1810.04805");

    getPaper.mockClear();
    await expect(loadPaper("1810.04805")).resolves.toMatchObject({ id: "1810.04805" });
    expect(getPaper).not.toHaveBeenCalled();
  });

  it("returns a stale cache when arXiv fails", async () => {
    const stale = { ...paper, id: "1907.11692" };
    await db.insert(paperCache).values({
      arxivId: stale.id,
      payload: stale,
      fetchedAt: new Date(Date.now() - PAPER_CACHE_TTL_MS - 1),
    });
    getPaper.mockRejectedValueOnce(new Error("arXiv 503"));

    await expect(loadPaper(stale.id)).resolves.toEqual(stale);
    expect(getPaper).toHaveBeenCalled();
  });
});

describe("briefing cache", () => {
  it("does not leak one reader's briefing to another", async () => {
    await saveBriefing("user-a", paper.id, briefing, "openai/gpt-5.5");

    await expect(getCachedBriefing("user-b", paper.id, "openai/gpt-5.5")).resolves.toBeUndefined();
    await expect(
      getCachedBriefing("user-a", paper.id, "openai/gpt-5.4-mini"),
    ).resolves.toBeUndefined();

    const stored = await getCachedBriefing("user-a", paper.id, "openai/gpt-5.5");
    expect(stored?.briefing.tldr).toBe(briefing.tldr);
  });
});
