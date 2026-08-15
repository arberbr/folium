import { beforeAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.TURSO_DATABASE_URL = ":memory:";
});

vi.mock("@/lib/auth", () => ({
  requireUserId: vi.fn(async () => "user_1"),
}));

// revalidate reaches next/cache, which has no request scope in a unit test.
vi.mock("@/lib/revalidate", () => ({
  revalidateCollection: vi.fn(),
  revalidateInterests: vi.fn(),
  revalidateLibraryPaper: vi.fn(),
  revalidatePaper: vi.fn(),
  revalidatePaperPages: vi.fn(),
}));

// Pulls in the Clerk backend SDK; none of these tests touch the key store.
vi.mock("@/lib/ai/openrouter", () => ({
  DISCONNECTED: { connected: false, hint: null, label: null },
  clearOpenRouterKey: vi.fn(),
  getOpenRouterConnection: vi.fn(),
  saveOpenRouterKey: vi.fn(),
}));

import { removePaperAction, savePaperAction, updatePaperStatusAction } from "@/lib/actions";
import { getLibraryItem } from "@/lib/data/user";
import { ready } from "@/lib/db";

beforeAll(async () => {
  await ready();
});

const PAPER = "1706.03762";

describe("savePaperAction", () => {
  it("queues a paper that is not in the library yet", async () => {
    const result = await savePaperAction(PAPER);
    expect(result.ok).toBe(true);
    expect((await getLibraryItem("user_1", PAPER))?.status).toBe("queued");
  });

  it("keeps the reading status a second save must not reset", async () => {
    const paper = "2005.14165";
    await updatePaperStatusAction(paper, "reading");
    expect((await getLibraryItem("user_1", paper))?.status).toBe("reading");

    // Saving an already-saved paper is "make sure it is in the library", not
    // "put it back in the queue" — this is what the SaveButton calls.
    await savePaperAction(paper);
    expect((await getLibraryItem("user_1", paper))?.status).toBe("reading");
  });

  it("rejects an id that is not an arXiv id", async () => {
    const result = await savePaperAction("not-a-paper");
    expect(result).toMatchObject({ ok: false, error: expect.any(String) });
  });
});

describe("updatePaperStatusAction", () => {
  it("adds the paper to the library when it is not saved yet", async () => {
    const paper = "1512.03385";
    await updatePaperStatusAction(paper, "done");
    expect((await getLibraryItem("user_1", paper))?.status).toBe("done");
  });

  it("rejects a status outside the reading vocabulary", async () => {
    const result = await updatePaperStatusAction(PAPER, "abandoned");
    expect(result).toMatchObject({ ok: false, error: expect.any(String) });
  });
});

describe("removePaperAction", () => {
  it("removes only the calling reader's copy", async () => {
    const paper = "1810.04805";
    await savePaperAction(paper);
    await removePaperAction(paper);
    expect(await getLibraryItem("user_1", paper)).toBeUndefined();
  });
});
