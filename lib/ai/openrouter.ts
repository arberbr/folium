import { clerkClient } from "@clerk/nextjs/server";

/**
 * Bring-your-own-key storage for OpenRouter.
 *
 * The key lives in Clerk `privateMetadata`, which is never included in the session
 * token or any client payload — only the Backend API can read it. Nothing in this
 * module returns the raw key to a caller that could serialize it to the browser;
 * `readOpenRouterKey` is for server-side provider construction only.
 */

const METADATA_KEY = "openrouter";
const KEY_INFO_URL = "https://openrouter.ai/api/v1/key";

type StoredConnection = {
  key: string;
  hint: string;
  label: string | null;
};

/** The client-safe view of a stored key: enough to recognise it, useless to a thief. */
export type OpenRouterConnection = {
  connected: boolean;
  hint: string | null;
  label: string | null;
};

export const DISCONNECTED: OpenRouterConnection = {
  connected: false,
  hint: null,
  label: null,
};

function stored(metadata: Record<string, unknown>): StoredConnection | null {
  const value = metadata[METADATA_KEY];
  if (!value || typeof value !== "object") return null;
  const { key, hint, label } = value as Partial<StoredConnection>;
  if (typeof key !== "string" || !key) return null;
  return { key, hint: typeof hint === "string" ? hint : maskKey(key), label: label ?? null };
}

function maskKey(key: string) {
  return key.slice(-4);
}

async function readStored(userId: string) {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return stored(user.privateMetadata);
}

/** Server-only. Returns the raw key for building a provider — never send this to a client. */
export async function readOpenRouterKey(userId: string) {
  const connection = await readStored(userId);
  return connection?.key ?? null;
}

export async function getOpenRouterConnection(userId: string): Promise<OpenRouterConnection> {
  const connection = await readStored(userId);
  if (!connection) return DISCONNECTED;
  return { connected: true, hint: connection.hint, label: connection.label };
}

/**
 * Asks OpenRouter to identify the key. This both validates it and gives us the key's
 * dashboard label, which is more useful than a bare "connected" badge.
 */
async function verifyKey(key: string) {
  let response: Response;
  try {
    response = await fetch(KEY_INFO_URL, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
  } catch {
    return { ok: false as const, error: "Could not reach OpenRouter. Try again in a moment." };
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false as const, error: "OpenRouter rejected that key." };
  }
  if (!response.ok) {
    return { ok: false as const, error: `OpenRouter returned ${response.status}. Try again later.` };
  }

  const body = (await response.json().catch(() => null)) as
    | { data?: { label?: unknown } }
    | null;
  const label = typeof body?.data?.label === "string" ? body.data.label : null;
  return { ok: true as const, label };
}

export async function saveOpenRouterKey(userId: string, rawKey: string) {
  const key = rawKey.trim();
  if (!key.startsWith("sk-or-")) {
    return { ok: false as const, error: "OpenRouter keys start with “sk-or-”." };
  }

  const verified = await verifyKey(key);
  if (!verified.ok) return verified;

  const connection: StoredConnection = { key, hint: maskKey(key), label: verified.label };
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { [METADATA_KEY]: connection },
  });

  return {
    ok: true as const,
    connection: { connected: true, hint: connection.hint, label: connection.label },
  };
}

export async function clearOpenRouterKey(userId: string) {
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { [METADATA_KEY]: null },
  });
}
