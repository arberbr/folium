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

if (!globalForDb.appDb) {
  globalForDb.appDb = createDb();
}

export const db = globalForDb.appDb ?? createDb();

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
