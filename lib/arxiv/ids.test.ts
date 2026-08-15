import { describe, expect, it } from "vitest";
import { arxivIdFromRoute, isArxivId, normalizeArxivId } from "./ids";

describe("normalizeArxivId", () => {
  it("strips id: prefix and version suffix", () => {
    expect(normalizeArxivId("id: 1706.03762v5")).toBe("1706.03762");
  });

  it("keeps pre-2007 archive ids", () => {
    expect(normalizeArxivId("cond-mat/0206368v1")).toBe("cond-mat/0206368");
  });
});

describe("isArxivId", () => {
  it("accepts modern and archive ids", () => {
    expect(isArxivId("1706.03762")).toBe(true);
    expect(isArxivId("math.GT/0309136")).toBe(true);
  });

  it("rejects a title fragment", () => {
    expect(isArxivId("attention is all you need")).toBe(false);
  });
});

describe("arxivIdFromRoute", () => {
  it("joins catch-all segments", () => {
    expect(arxivIdFromRoute(["cond-mat", "0206368"])).toBe("cond-mat/0206368");
  });
});
