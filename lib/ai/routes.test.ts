import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("@/lib/data/papers", () => ({
  loadPaper: vi.fn(),
  saveBriefing: vi.fn(),
}));

vi.mock("@/lib/ai/models", () => ({
  resolveModel: vi.fn(),
}));

import { resolveModel } from "@/lib/ai/models";
import { POST_ANALYZE, POST_CHAT } from "@/lib/ai/routes";
import { requireUserId } from "@/lib/auth";
import { loadPaper } from "@/lib/data/papers";

const loadPaperMock = vi.mocked(loadPaper);
const resolveModelMock = vi.mocked(resolveModel);
const requireUserIdMock = vi.mocked(requireUserId);

const paper = {
  id: "1706.03762",
  version: null,
  title: "Attention Is All You Need",
  summary: "We propose the Transformer.",
  authors: [{ name: "Ashish Vaswani" }],
  categories: ["cs.CL"],
  primaryCategory: "cs.CL",
  published: "2017-06-12T17:57:34Z",
  updated: "2017-06-12T17:57:34Z",
  pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
  absUrl: "https://arxiv.org/abs/1706.03762",
  htmlUrl: "https://ar5iv.labs.arxiv.org/html/1706.03762",
};

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  loadPaperMock.mockReset();
  resolveModelMock.mockReset();
  requireUserIdMock.mockReset();
  requireUserIdMock.mockResolvedValue("user_1");
});

/**
 * These two routes spend the reader's own OpenRouter credits, and proxy.ts is a
 * session handshake only — requireUserId is the whole gate. Assert it runs
 * before any work and that its rejection is never swallowed into a response.
 */
describe.each([
  ["POST_ANALYZE", POST_ANALYZE, { arxivId: "1706.03762" }],
  [
    "POST_CHAT",
    POST_CHAT,
    { arxivId: "1706.03762", messages: [{ id: "m1", role: "user", parts: [{ type: "text" }] }] },
  ],
] as const)("%s authentication", (_name, handler, body) => {
  it("refuses an anonymous request instead of answering it", async () => {
    requireUserIdMock.mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(handler(jsonRequest("http://localhost/api/papers", body))).rejects.toThrow(
      /Unauthorized/,
    );
    expect(loadPaperMock).not.toHaveBeenCalled();
    expect(resolveModelMock).not.toHaveBeenCalled();
  });
});

describe("POST_ANALYZE", () => {
  it("rejects invalid JSON", async () => {
    const response = await POST_ANALYZE(
      new Request("http://localhost/api/papers/analyze", {
        method: "POST",
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when the paper is missing", async () => {
    loadPaperMock.mockResolvedValueOnce(null);
    const response = await POST_ANALYZE(
      jsonRequest("http://localhost/api/papers/analyze", { arxivId: "1706.03762" }),
    );
    expect(response.status).toBe(404);
  });

  it("returns 503 when the reader has no model key", async () => {
    loadPaperMock.mockResolvedValueOnce(paper);
    resolveModelMock.mockResolvedValueOnce(null);
    const response = await POST_ANALYZE(
      jsonRequest("http://localhost/api/papers/analyze", { arxivId: "1706.03762" }),
    );
    expect(response.status).toBe(503);
  });
});

describe("POST_CHAT", () => {
  it("rejects an untyped message payload", async () => {
    const response = await POST_CHAT(
      jsonRequest("http://localhost/api/papers/chat", {
        arxivId: "1706.03762",
        messages: [{ role: "user" }],
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
  });

  it("returns 404 when the paper is missing", async () => {
    loadPaperMock.mockResolvedValueOnce(null);
    const response = await POST_CHAT(
      jsonRequest("http://localhost/api/papers/chat", {
        arxivId: "1706.03762",
        messages: [{ id: "m1", role: "user", parts: [{ type: "text", text: "hi" }] }],
      }),
    );
    expect(response.status).toBe(404);
  });
});
