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
});

export const env = envSchema.parse({
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  ARXIV_USER_AGENT: process.env.ARXIV_USER_AGENT,
});
