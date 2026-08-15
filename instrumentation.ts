export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ready, shouldAutoMigrate } = await import("@/lib/db");

  if (!shouldAutoMigrate()) {
    // Not silent: an unmigrated remote database otherwise fails later, at the
    // first query, with an error that says nothing about migrations.
    console.warn(
      "[db] Remote database detected — skipping boot migrations. Run `pnpm db:migrate`, or set DB_AUTO_MIGRATE=1.",
    );
    return;
  }

  await ready();
}
