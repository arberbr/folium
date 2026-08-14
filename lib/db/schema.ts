import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { PaperBriefing } from "../ai/schema";
import type { ArxivPaper } from "../arxiv/types";

export const readingStatuses = ["queued", "reading", "done", "skipped"] as const;
export type ReadingStatus = (typeof readingStatuses)[number];

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  interests: text("interests", { mode: "json" }).$type<string[]>().notNull(),
  digestFrequency: text("digest_frequency").notNull().default("daily"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const libraryItems = sqliteTable(
  "library_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    arxivId: text("arxiv_id").notNull(),
    status: text("status").$type<ReadingStatus>().notNull().default("queued"),
    notes: text("notes").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("library_user_paper_idx").on(table.userId, table.arxivId),
    index("library_user_idx").on(table.userId),
  ],
);

export const collections = sqliteTable(
  "collections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    shareToken: text("share_token"),
    description: text("description").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("collections_user_idx").on(table.userId),
    uniqueIndex("collections_user_slug_idx").on(table.userId, table.slug),
    uniqueIndex("collections_share_token_idx").on(table.shareToken),
  ],
);

export const collectionPapers = sqliteTable(
  "collection_papers",
  {
    collectionId: text("collection_id").notNull(),
    arxivId: text("arxiv_id").notNull(),
    addedAt: integer("added_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.arxivId] })],
);

export const analyses = sqliteTable("analyses", {
  arxivId: text("arxiv_id").primaryKey(),
  briefing: text("briefing", { mode: "json" }).$type<PaperBriefing>().notNull(),
  model: text("model").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const paperCache = sqliteTable("paper_cache", {
  arxivId: text("arxiv_id").primaryKey(),
  payload: text("payload", { mode: "json" }).$type<ArxivPaper>().notNull(),
  fetchedAt: integer("fetched_at", { mode: "timestamp_ms" }).notNull(),
});
