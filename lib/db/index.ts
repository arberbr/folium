import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const DEFAULT_URL = "file:./data/folium.db";

type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as {
  foliumDb?: Db;
  foliumReady?: Promise<void>;
};

function resolveUrl() {
  return process.env.TURSO_DATABASE_URL ?? DEFAULT_URL;
}

function ensureLocalFile(url: string) {
  if (!url.startsWith("file:")) return;
  const filePath = url.slice("file:".length);
  mkdirSync(dirname(filePath), { recursive: true });
}

function createDb() {
  const url = resolveUrl();
  ensureLocalFile(url);
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

export const db = globalForDb.foliumDb ?? createDb();
if (process.env.NODE_ENV !== "production") {
  globalForDb.foliumDb = db;
}

export async function ensureSchema() {
  if (!globalForDb.foliumReady) {
    globalForDb.foliumReady = (async () => {
      await db.run(sql.raw(`
        CREATE TABLE IF NOT EXISTS profiles (
          user_id TEXT PRIMARY KEY,
          interests TEXT NOT NULL,
          digest_frequency TEXT NOT NULL DEFAULT 'daily',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `));
      await db.run(sql.raw(`
        CREATE TABLE IF NOT EXISTS library_items (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          arxiv_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'queued',
          notes TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `));
      await db.run(
        sql.raw(`CREATE UNIQUE INDEX IF NOT EXISTS library_user_paper_idx ON library_items (user_id, arxiv_id)`),
      );
      await db.run(
        sql.raw(`CREATE INDEX IF NOT EXISTS library_user_idx ON library_items (user_id)`),
      );
      await db.run(sql.raw(`
        CREATE TABLE IF NOT EXISTS collections (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          slug TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL
        )
      `));
      await db.run(
        sql.raw(`CREATE INDEX IF NOT EXISTS collections_user_idx ON collections (user_id)`),
      );
      try {
        await db.run(sql.raw(`ALTER TABLE collections ADD COLUMN slug TEXT NOT NULL DEFAULT ''`));
      } catch {
        // Column already exists on databases created before slugs.
      }
      await db.run(sql.raw(`
        CREATE TABLE IF NOT EXISTS collection_papers (
          collection_id TEXT NOT NULL,
          arxiv_id TEXT NOT NULL,
          added_at INTEGER NOT NULL,
          PRIMARY KEY (collection_id, arxiv_id)
        )
      `));
      await db.run(sql.raw(`
        CREATE TABLE IF NOT EXISTS analyses (
          arxiv_id TEXT PRIMARY KEY,
          briefing TEXT NOT NULL,
          model TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `));
      await db.run(sql.raw(`
        CREATE TABLE IF NOT EXISTS paper_cache (
          arxiv_id TEXT PRIMARY KEY,
          payload TEXT NOT NULL,
          fetched_at INTEGER NOT NULL
        )
      `));
    })();
  }

  await globalForDb.foliumReady;
}
