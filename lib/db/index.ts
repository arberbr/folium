import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const DEFAULT_URL = "file:./data/local.db";

type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as {
  appDb?: Db;
  appDbReady?: Promise<void>;
  appDbSchemaVersion?: number;
};

const SCHEMA_VERSION = 3;

function resolveUrl() {
  return process.env.TURSO_DATABASE_URL || DEFAULT_URL;
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

if (
  !globalForDb.appDb ||
  globalForDb.appDbSchemaVersion !== SCHEMA_VERSION
) {
  globalForDb.appDb = createDb();
  globalForDb.appDbReady = undefined;
  globalForDb.appDbSchemaVersion = SCHEMA_VERSION;
}

export const db = globalForDb.appDb ?? createDb();

// Everything that can be declared up front, in one round trip. The legacy
// ALTERs below have to land between the two batches: on databases created
// before slugs and share links, the columns they add are what the trailing
// share_token index depends on.
const SCHEMA_HEAD = `
  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    interests TEXT NOT NULL,
    digest_frequency TEXT NOT NULL DEFAULT 'daily',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS library_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    arxiv_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    notes TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS library_user_paper_idx ON library_items (user_id, arxiv_id);
  CREATE INDEX IF NOT EXISTS library_user_idx ON library_items (user_id);
  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL DEFAULT '',
    share_token TEXT,
    description TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS collections_user_idx ON collections (user_id);
`;

const SCHEMA_TAIL = `
  CREATE UNIQUE INDEX IF NOT EXISTS collections_share_token_idx ON collections (share_token);
  CREATE TABLE IF NOT EXISTS collection_papers (
    collection_id TEXT NOT NULL,
    arxiv_id TEXT NOT NULL,
    added_at INTEGER NOT NULL,
    PRIMARY KEY (collection_id, arxiv_id)
  );
  CREATE TABLE IF NOT EXISTS analyses (
    arxiv_id TEXT PRIMARY KEY,
    briefing TEXT NOT NULL,
    model TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS paper_cache (
    arxiv_id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  );
`;

export async function ensureSchema() {
  if (globalForDb.appDbSchemaVersion !== SCHEMA_VERSION) {
    globalForDb.appDbReady = undefined;
    globalForDb.appDbSchemaVersion = SCHEMA_VERSION;
  }
  if (!globalForDb.appDbReady) {
    const pending = (async () => {
      const client = db.$client;
      await client.executeMultiple(SCHEMA_HEAD);
      try {
        await db.run(sql.raw(`ALTER TABLE collections ADD COLUMN slug TEXT NOT NULL DEFAULT ''`));
      } catch {
        // Column already exists on databases created before slugs.
      }
      try {
        await db.run(sql.raw(`ALTER TABLE collections ADD COLUMN share_token TEXT`));
      } catch {
        // Column already exists on databases created before share links.
      }
      await client.executeMultiple(SCHEMA_TAIL);
    })();

    // Don't cache a rejection — a transient DB blip would otherwise poison
    // every later request served by this instance.
    globalForDb.appDbReady = pending.catch((error) => {
      globalForDb.appDbReady = undefined;
      throw error;
    });
  }

  await globalForDb.appDbReady;
}
