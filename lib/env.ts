import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

const envSchema = z.object({
  TURSO_DATABASE_URL: optionalText,
  TURSO_AUTH_TOKEN: optionalText,
  ARXIV_USER_AGENT: optionalText,
  /** Opt in to migrating a remote database on boot. Local files always migrate. */
  DB_AUTO_MIGRATE: optionalText.pipe(z.enum(["1", "true"]).optional()),
});

export const env = envSchema.parse({
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  ARXIV_USER_AGENT: process.env.ARXIV_USER_AGENT,
  DB_AUTO_MIGRATE: process.env.DB_AUTO_MIGRATE,
});
