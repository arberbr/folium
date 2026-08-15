import { describe, expect, it } from "vitest";
import { isFreshCache, PAPER_CACHE_TTL_MS } from "./cache";

describe("isFreshCache", () => {
  it("treats a just-fetched row as fresh", () => {
    const now = new Date("2026-08-15T12:00:00Z");
    expect(isFreshCache(now, now)).toBe(true);
  });

  it("treats a row older than the TTL as stale", () => {
    const now = new Date("2026-08-15T12:00:00Z");
    const fetchedAt = new Date(now.getTime() - PAPER_CACHE_TTL_MS - 1);
    expect(isFreshCache(fetchedAt, now)).toBe(false);
  });
});
