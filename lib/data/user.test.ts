import { beforeAll, describe, expect, it, vi } from "vitest";

// In-memory: each test file gets its own throwaway database, and nothing is
// left behind in ./data for the next run to trip over.
vi.hoisted(() => {
  process.env.TURSO_DATABASE_URL = ":memory:";
});

import { ready } from "@/lib/db";
import {
  addToCollection,
  createCollection,
  getPublicCollectionByShareToken,
  publishCollection,
  unpublishCollection,
} from "@/lib/data/user";

beforeAll(async () => {
  await ready();
});

describe("collection ownership", () => {
  it("rejects adding a paper to someone else's collection", async () => {
    const shelf = await createCollection("owner", "Transformers");
    await expect(addToCollection("intruder", shelf.id, "1706.03762")).rejects.toThrow(
      /Collection not found/,
    );
  });
});

describe("publish and unpublish", () => {
  it("issues a share token that anonymous readers can load, then revokes it", async () => {
    const shelf = await createCollection("owner", "Public shelf");
    const published = await publishCollection("owner", shelf.id);
    expect(published.shareToken).toMatch(/^[23456789abcdefghjkmnpqrstuvwxyz]{12}$/);

    const visible = await getPublicCollectionByShareToken(published.shareToken ?? "");
    expect(visible?.id).toBe(shelf.id);

    await unpublishCollection("owner", shelf.id);
    expect(await getPublicCollectionByShareToken(published.shareToken ?? "")).toBeNull();
  });

  it("rejects publishing someone else's collection", async () => {
    const shelf = await createCollection("owner", "Private");
    await expect(publishCollection("intruder", shelf.id)).rejects.toThrow(/Collection not found/);
  });
});
