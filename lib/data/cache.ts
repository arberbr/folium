export const PAPER_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isFreshCache(fetchedAt: Date, now = new Date(), ttlMs = PAPER_CACHE_TTL_MS) {
  return now.getTime() - fetchedAt.getTime() < ttlMs;
}
