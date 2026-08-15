import { z } from "zod";
import { CATEGORY_LABEL } from "@/lib/arxiv/categories";
import { isArxivId, normalizeArxivId } from "@/lib/arxiv/ids";
import { readingStatuses } from "@/lib/db/schema";

export const CHAT_MAX_MESSAGES = 20;
export const CHAT_MAX_BODY_CHARS = 50_000;

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

export const openRouterKeySchema = z
  .string()
  .trim()
  .min(1)
  .refine((key) => key.startsWith("sk-or-"), "OpenRouter keys start with “sk-or-”.");

export const analyzeBodySchema = z.object({
  arxivId: arxivIdSchema,
});

export const chatBodySchema = z
  .object({
    arxivId: arxivIdSchema,
    messages: z.array(z.unknown()).max(CHAT_MAX_MESSAGES, "Too many chat messages"),
  })
  .superRefine((body, ctx) => {
    const size = JSON.stringify(body.messages).length;
    if (size > CHAT_MAX_BODY_CHARS) {
      ctx.addIssue({
        code: "custom",
        message: "Chat payload is too large",
        path: ["messages"],
      });
    }
  });

export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function parseWith<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(issue?.message ?? "Invalid input");
  }
  return result.data;
}

export function parseJsonBody<T>(schema: z.ZodType<T>, value: unknown): ParseResult<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { ok: false, error: issue?.message ?? "Invalid request" };
  }
  return { ok: true, data: result.data };
}
