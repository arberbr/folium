import { describe, expect, it } from "vitest";
import { CATEGORY_LABEL, FEATURED_IDS } from "@/lib/arxiv/categories";
import { SCHEMA_SQL } from "@/lib/db";

const TABLES = [
  "profiles",
  "library_items",
  "collections",
  "collection_papers",
  "analyses",
  "paper_cache",
];

describe("SCHEMA_SQL", () => {
  it("declares every Drizzle table", () => {
    for (const table of TABLES) {
      expect(SCHEMA_SQL).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it("no longer creates dropped columns", () => {
    expect(SCHEMA_SQL).not.toContain("digest_frequency");
    expect(SCHEMA_SQL).not.toContain("notes");
  });
});

describe("FEATURED_IDS", () => {
  it("uses labels from the full catalog", () => {
    for (const id of FEATURED_IDS) {
      expect(CATEGORY_LABEL[id]).toBeTruthy();
    }
  });
});
