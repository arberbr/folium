/**
 * The AI SDK turns a non-2xx analyze/chat response into `new Error(await response.text())`,
 * so `error.message` arrives as the raw body — for our routes, a JSON envelope. Unwrap it
 * so the reader sees the sentence the route wrote instead of `{"error":"…"}`.
 */
export function readableAiError(error: Error | undefined, fallback: string) {
  if (!error) return null;

  const raw = error.message?.trim();
  if (!raw) return fallback;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      const message = (parsed as { error: unknown }).error;
      if (typeof message === "string" && message.trim()) return message;
    }
  } catch {
    // Not a JSON envelope — a network failure, or a message straight from the
    // provider. Either way it is already human-readable.
  }

  return raw;
}
