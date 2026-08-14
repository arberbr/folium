export const MODELS = {
  briefing: "openai/gpt-5.5",
  chat: "openai/gpt-5.4-mini",
} as const;

export function hasAiKey() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.OPENAI_API_KEY,
  );
}
