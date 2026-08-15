import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { readOpenRouterKey } from "@/lib/ai/openrouter";

/**
 * arXivDesk is bring-your-own-key: every live briefing and chat runs on the reader's own
 * OpenRouter key, so there is no shared provider credential and no AI cost to the host.
 * Readers without a key still get the heuristic sketch built from the abstract.
 */
export const MODELS: Record<ModelRole, string> = {
  briefing: "openai/gpt-5.5",
  chat: "openai/gpt-5.4-mini",
};

export type ModelRole = "briefing" | "chat";

/** True when this user has connected a key and can run a live briefing. */
export async function hasAiAccess(userId: string | null) {
  if (!userId) return false;
  return Boolean(await readOpenRouterKey(userId));
}

export type ResolvedModel = {
  model: LanguageModel;
  /** The slug to record alongside anything this model produces. */
  id: string;
};

/** Returns null when the user has not connected a key — callers should answer 503. */
export async function resolveModel(userId: string, role: ModelRole): Promise<ResolvedModel | null> {
  const key = await readOpenRouterKey(userId);
  if (!key) return null;

  const openrouter = createOpenRouter({
    apiKey: key,
    compatibility: "strict",
    appName: "arXivDesk",
  });
  const id = MODELS[role];
  return { model: openrouter.chat(id), id };
}

export const NO_MODEL_MESSAGE =
  "Connect your OpenRouter key under Integrations in your account menu to run a live briefing.";
