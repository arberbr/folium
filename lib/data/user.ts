import { and, desc, eq, inArray } from "drizzle-orm";
import { customAlphabet, nanoid } from "nanoid";
import { db } from "@/lib/db";
import { collectionPapers, collections, libraryItems, profiles, type ReadingStatus } from "@/lib/db/schema";
import { DEFAULT_INTERESTS } from "@/lib/arxiv/categories";
import { uniqueSlug } from "@/lib/format";

const createShareToken = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 12);

export async function getOrCreateProfile(userId: string) {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (existing) return existing;

  const now = new Date();
  const created = {
    userId,
    interests: DEFAULT_INTERESTS,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(profiles).values(created);
  return created;
}

export async function updateInterests(userId: string, interests: string[]) {
  const profile = await getOrCreateProfile(userId);
  const now = new Date();
  await db
    .update(profiles)
    .set({ interests, updatedAt: now })
    .where(eq(profiles.userId, profile.userId));
}

export async function getLibrary(userId: string) {
  return db.query.libraryItems.findMany({
    where: eq(libraryItems.userId, userId),
    orderBy: [desc(libraryItems.updatedAt)],
  });
}

export async function getLibraryItem(userId: string, arxivId: string) {
  return db.query.libraryItems.findFirst({
    where: and(eq(libraryItems.userId, userId), eq(libraryItems.arxivId, arxivId)),
  });
}

export async function upsertLibraryItem(input: {
  userId: string;
  arxivId: string;
  status?: ReadingStatus;
}) {
  const existing = await getLibraryItem(input.userId, input.arxivId);
  const now = new Date();

  if (existing) {
    await db
      .update(libraryItems)
      .set({
        status: input.status ?? existing.status,
        updatedAt: now,
      })
      .where(eq(libraryItems.id, existing.id));
    return { ...existing, status: input.status ?? existing.status };
  }

  const item = {
    id: nanoid(),
    userId: input.userId,
    arxivId: input.arxivId,
    status: input.status ?? "queued",
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(libraryItems).values(item);
  return item;
}

export async function removeLibraryItem(userId: string, arxivId: string) {
  await db
    .delete(libraryItems)
    .where(and(eq(libraryItems.userId, userId), eq(libraryItems.arxivId, arxivId)));
}

async function paperIdsByCollection(collectionIds: string[]) {
  const byCollection = new Map<string, string[]>();
  if (!collectionIds.length) return byCollection;

  const papers = await db.query.collectionPapers.findMany({
    where: inArray(collectionPapers.collectionId, collectionIds),
  });

  for (const row of papers) {
    const existing = byCollection.get(row.collectionId);
    if (existing) existing.push(row.arxivId);
    else byCollection.set(row.collectionId, [row.arxivId]);
  }

  return byCollection;
}

export async function getCollections(userId: string) {
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(desc(collections.createdAt));
  if (!rows.length) return [];

  const byCollection = await paperIdsByCollection(rows.map((row) => row.id));
  return rows.map((collection) => ({
    ...collection,
    paperIds: byCollection.get(collection.id) ?? [],
  }));
}

export async function getCollectionBySlug(userId: string, slug: string) {
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.userId, userId), eq(collections.slug, slug)),
  });
  if (!collection) return null;

  const byCollection = await paperIdsByCollection([collection.id]);
  return { ...collection, paperIds: byCollection.get(collection.id) ?? [] };
}

async function takenSlugs(userId: string, exceptId?: string) {
  const existing = await db.query.collections.findMany({
    where: eq(collections.userId, userId),
  });
  return new Set(
    existing
      .filter((row) => row.id !== exceptId)
      .map((row) => row.slug)
      .filter(Boolean),
  );
}

async function requireOwnedCollection(userId: string, collectionId: string) {
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
  });
  if (!collection) throw new Error("Collection not found");
  return collection;
}

export async function createCollection(userId: string, name: string, description = "") {
  const taken = await takenSlugs(userId);
  const collection = {
    id: nanoid(),
    userId,
    name,
    slug: uniqueSlug(name, taken),
    description,
    createdAt: new Date(),
  };
  await db.insert(collections).values(collection);
  return collection;
}

export async function addToCollection(userId: string, collectionId: string, arxivId: string) {
  const collection = await requireOwnedCollection(userId, collectionId);
  await db
    .insert(collectionPapers)
    .values({ collectionId, arxivId, addedAt: new Date() })
    .onConflictDoNothing();
  return collection;
}

export async function removeFromCollection(userId: string, collectionId: string, arxivId: string) {
  const collection = await requireOwnedCollection(userId, collectionId);
  await db
    .delete(collectionPapers)
    .where(
      and(eq(collectionPapers.collectionId, collectionId), eq(collectionPapers.arxivId, arxivId)),
    );
  return collection;
}

export async function renameCollection(userId: string, collectionId: string, name: string) {
  const collection = await requireOwnedCollection(userId, collectionId);
  const taken = await takenSlugs(userId, collectionId);
  const slug = uniqueSlug(name, taken);

  await db.update(collections).set({ name, slug }).where(eq(collections.id, collectionId));

  return { previousSlug: collection.slug, ...collection, name, slug };
}

async function uniqueShareToken() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const token = createShareToken();
    const [existing] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.shareToken, token))
      .limit(1);
    if (!existing) return token;
  }
  throw new Error("Could not generate a share link");
}

export async function getPublicCollectionByShareToken(token: string) {
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.shareToken, token))
    .limit(1);
  if (!collection?.shareToken) return null;

  const byCollection = await paperIdsByCollection([collection.id]);
  return {
    ...collection,
    paperIds: byCollection.get(collection.id) ?? [],
  };
}

export async function publishCollection(userId: string, collectionId: string) {
  const collection = await requireOwnedCollection(userId, collectionId);
  if (collection.shareToken) return collection;

  const shareToken = await uniqueShareToken();
  await db.update(collections).set({ shareToken }).where(eq(collections.id, collectionId));
  return { ...collection, shareToken };
}

export async function unpublishCollection(userId: string, collectionId: string) {
  const collection = await requireOwnedCollection(userId, collectionId);
  const previousShareToken = collection.shareToken;
  await db.update(collections).set({ shareToken: null }).where(eq(collections.id, collectionId));
  return { ...collection, previousShareToken, shareToken: null };
}

export async function deleteCollection(userId: string, collectionId: string) {
  const collection = await requireOwnedCollection(userId, collectionId);

  await db.transaction(async (tx) => {
    await tx.delete(collectionPapers).where(eq(collectionPapers.collectionId, collectionId));
    await tx
      .delete(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)));
  });

  return collection;
}
