import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import {
  revalidateCollection,
  revalidateInterests,
  revalidateLibraryPaper,
  revalidatePaperPages,
} from "./revalidate";

const revalidatePathMock = vi.mocked(revalidatePath);

beforeEach(() => {
  revalidatePathMock.mockReset();
});

describe("revalidateLibraryPaper", () => {
  it("invalidates the library and the catch-all paper URL, not an encoded slash", () => {
    revalidateLibraryPaper("cond-mat/0206368");

    expect(revalidatePathMock).toHaveBeenCalledWith("/library");
    expect(revalidatePathMock).toHaveBeenCalledWith("/paper/cond-mat/0206368");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/paper/cond-mat%2F0206368");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/paper/[id]", "page");
  });

  it("uses the modern id path as-is", () => {
    revalidateLibraryPaper("1706.03762");
    expect(revalidatePathMock).toHaveBeenCalledWith("/paper/1706.03762");
  });
});

describe("revalidatePaperPages", () => {
  it("invalidates the catch-all paper route, not [id]", () => {
    revalidatePaperPages();
    expect(revalidatePathMock).toHaveBeenCalledWith("/paper/[...id]", "page");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/paper/[id]", "page");
  });
});

describe("revalidateCollection", () => {
  it("invalidates the index, slug, previous slug, and share URLs", () => {
    revalidateCollection({
      slug: "transformers",
      previousSlug: "old-name",
      shareToken: "abc123def456",
      previousShareToken: "oldtokenxxxx",
    });

    expect(revalidatePathMock).toHaveBeenCalledWith("/collections");
    expect(revalidatePathMock).toHaveBeenCalledWith("/collection/transformers");
    expect(revalidatePathMock).toHaveBeenCalledWith("/collection/old-name");
    expect(revalidatePathMock).toHaveBeenCalledWith("/shared/abc123def456");
    expect(revalidatePathMock).toHaveBeenCalledWith("/shared/oldtokenxxxx");
  });

  it("skips missing share tokens and previous slugs", () => {
    revalidateCollection({ slug: "notes" });

    expect(revalidatePathMock).toHaveBeenCalledWith("/collections");
    expect(revalidatePathMock).toHaveBeenCalledWith("/collection/notes");
    expect(revalidatePathMock.mock.calls).toHaveLength(2);
  });
});

describe("revalidateInterests", () => {
  it("refreshes today and settings", () => {
    revalidateInterests();
    expect(revalidatePathMock).toHaveBeenCalledWith("/today");
    expect(revalidatePathMock).toHaveBeenCalledWith("/settings");
  });
});
