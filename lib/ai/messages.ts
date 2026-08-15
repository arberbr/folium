/**
 * Copy shared between the AI routes and the panels that call them. Kept in its
 * own module with no imports: `lib/ai/models` reaches the Clerk backend SDK, so
 * a client component must never import the message from there.
 */

export const CONNECT_KEY_MESSAGE =
  "Connect your OpenRouter key under Integrations in your account menu to run a live briefing.";

export const CONNECT_KEY_CHAT_MESSAGE =
  "Connect your OpenRouter key under Integrations in your account menu to ask questions about this paper.";
