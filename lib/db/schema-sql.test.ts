import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORY_LABEL, FEATURED_IDS } from "@/lib/arxiv/categories";

const TABLES = [
  "profiles",
  "library_items",
  "collections",
  "collection_papers",
  "analyses",
  "paper_cache",
];

const initSql = readFileSync(join(process.cwd(), "drizzle", "0000_init.sql"), "utf8");
const analysesSql = readFileSync(
  join(process.cwd(), "drizzle", "0001_analyses_user_scoped.sql"),
  "utf8",
);

describe("drizzle migrations", () => {
  it("declare every Drizzle table except analyses", () => {
    for (const table of TABLES.filter((table) => table !== "analyses")) {
      expect(initSql).toContain(`CREATE TABLE IF NOT EXISTS \`${table}\``);
    }
  });

  it("scope analyses to user, paper, and model", () => {
    expect(analysesSql).toContain("DROP TABLE IF EXISTS `analyses`");
    expect(analysesSql).toContain("PRIMARY KEY(`user_id`, `arxiv_id`, `model`)");
  });

  it("no longer create dropped columns", () => {
    expect(initSql).not.toContain("digest_frequency");
    expect(initSql).not.toContain("notes");
  });
});

describe("FEATURED_IDS", () => {
  it("uses labels from the full catalog", () => {
    for (const id of FEATURED_IDS) {
      expect(CATEGORY_LABEL[id]).toBeTruthy();
    }
  });
});
