import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "@/lib/env";
import * as schema from "./schema";

const DEFAULT_URL = "file:./data/local.db";
const MIGRATIONS_FOLDER = join(process.cwd(), "drizzle");

type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as {
  appDb?: Db;
  appDbReady?: Promise<void>;
};

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

globalForDb.appDb ??= createDb();

export const db = globalForDb.appDb;

/**
 * True for a local file (or in-memory) database, which is disposable and safe to
 * migrate on boot. A remote Turso URL is somebody's real data.
 */
function isLocalDb(url: string) {
  return url.startsWith("file:") || url === ":memory:";
}

/**
 * Migrations include destructive statements, so a deploy must not apply them to
 * a remote database just by starting up — run `pnpm db:migrate` from CI, or set
 * DB_AUTO_MIGRATE=1 to accept the risk. Local databases always migrate, so
 * `pnpm dev` still works against a fresh ./data/local.db with no setup.
 */
export function shouldAutoMigrate() {
  return isLocalDb(resolveUrl()) || Boolean(env.DB_AUTO_MIGRATE);
}

/** Apply Drizzle migrations once per process. Call from instrumentation and tests. */
export async function ready() {
  if (!globalForDb.appDbReady) {
    const pending = migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    globalForDb.appDbReady = pending.catch((error) => {
      globalForDb.appDbReady = undefined;
      throw error;
    });
  }

  await globalForDb.appDbReady;
}
