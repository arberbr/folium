import { z } from "zod";
import { CATEGORY_LABEL } from "@/lib/arxiv/categories";
import { isArxivId, normalizeArxivId } from "@/lib/arxiv/ids";
import { readingStatuses } from "@/lib/db/schema";
import { ActionError } from "@/lib/errors";

export const arxivIdSchema = z
  .string()
  .trim()
  .min(1, "Missing arxivId")
  .refine(isArxivId, "That is not a valid arXiv id")
  .transform(normalizeArxivId);

export const collectionIdSchema = z.string().trim().min(8).max(48);

export const collectionNameSchema = z
  .string()
  .trim()
  .min(1, "Name a collection")
  .max(120)
  .transform((name) => name || "Untitled collection");

export const readingStatusSchema = z.enum(readingStatuses);

export const interestsSchema = z
  .array(z.string())
  .min(1, "Pick at least one field")
  .max(Object.keys(CATEGORY_LABEL).length)
  .refine((ids) => ids.every((id) => id in CATEGORY_LABEL), "Unknown arXiv category");

export const OPENROUTER_KEY_PREFIX = "sk-or-";

export const openRouterKeySchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (key) => key.startsWith(OPENROUTER_KEY_PREFIX),
    `OpenRouter keys start with “${OPENROUTER_KEY_PREFIX}”.`,
  );

export function parseWith<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ActionError(issue?.message ?? "Invalid input");
  }
  return result.data;
}
