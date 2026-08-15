import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/lib/env";
import { uniqueSlug } from "@/lib/format";
import * as schema from "./schema";
import { collections } from "./schema";

const DEFAULT_URL = "file:./data/local.db";

type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as {
  appDb?: Db;
  appDbReady?: Promise<void>;
  appDbSchemaVersion?: number;
};

const SCHEMA_VERSION = 4;

function resolveUrl() {
  return env.TURSO_DATABASE_URL || DEFAULT_URL;
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
    authToken: env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

if (!globalForDb.appDb || globalForDb.appDbSchemaVersion !== SCHEMA_VERSION) {
  globalForDb.appDb = createDb();
  globalForDb.appDbReady = undefined;
  globalForDb.appDbSchemaVersion = SCHEMA_VERSION;
}

export const db = globalForDb.appDb ?? createDb();

/**
 * Keep this in lockstep with `schema.ts`. Extra columns on older local files
 * (notes, digest_frequency) are left in place; Drizzle simply stops reading them.
 */
export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    interests TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS library_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    arxiv_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
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

async function tableColumns(table: string) {
  const result = await db.$client.execute(`PRAGMA table_info(${table})`);
  return new Set(result.rows.map((row) => String(row.name)));
}

async function addColumnIfMissing(table: string, column: string, ddl: string) {
  const columns = await tableColumns(table);
  if (columns.has(column)) return;
  await db.$client.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}

async function backfillEmptySlugs() {
  const rows = await db.select().from(collections);
  const takenByUser = new Map<string, Set<string>>();
  for (const row of rows) {
    const taken = takenByUser.get(row.userId) ?? new Set<string>();
    if (row.slug) taken.add(row.slug);
    takenByUser.set(row.userId, taken);
  }

  for (const row of rows) {
    if (row.slug) continue;
    const taken = takenByUser.get(row.userId) ?? new Set<string>();
    const slug = uniqueSlug(row.name, taken);
    taken.add(slug);
    await db.update(collections).set({ slug }).where(eq(collections.id, row.id));
  }
}

export async function ensureSchema() {
  if (globalForDb.appDbSchemaVersion !== SCHEMA_VERSION) {
    globalForDb.appDbReady = undefined;
    globalForDb.appDbSchemaVersion = SCHEMA_VERSION;
  }
  if (!globalForDb.appDbReady) {
    const pending = (async () => {
      await db.$client.executeMultiple(SCHEMA_SQL);
      await addColumnIfMissing("collections", "slug", "slug TEXT NOT NULL DEFAULT ''");
      await addColumnIfMissing("collections", "share_token", "share_token TEXT");
      await backfillEmptySlugs();
      await db.$client.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS collections_user_slug_idx ON collections (user_id, slug)",
      );
    })();

    globalForDb.appDbReady = pending.catch((error) => {
      globalForDb.appDbReady = undefined;
      throw error;
    });
  }

  await globalForDb.appDbReady;
}
