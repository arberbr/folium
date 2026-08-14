import { and, desc, eq, inArray } from "drizzle-orm";
import { customAlphabet, nanoid } from "nanoid";
import { db, ensureSchema } from "@/lib/db";
import { collectionPapers, collections, libraryItems, profiles, type ReadingStatus } from "@/lib/db/schema";
import { DEFAULT_INTERESTS } from "@/lib/arxiv/categories";
import { slugify } from "@/lib/format";

const createShareToken = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 7);

export async function getOrCreateProfile(userId: string) {
  await ensureSchema();
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (existing) return existing;

  const now = new Date();
  const created = {
    userId,
    interests: DEFAULT_INTERESTS,
    digestFrequency: "daily",
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
  await ensureSchema();
  return db.query.libraryItems.findMany({
    where: eq(libraryItems.userId, userId),
    orderBy: [desc(libraryItems.updatedAt)],
  });
}

export async function getLibraryItem(userId: string, arxivId: string) {
  await ensureSchema();
  return db.query.libraryItems.findFirst({
    where: and(eq(libraryItems.userId, userId), eq(libraryItems.arxivId, arxivId)),
  });
}

export async function upsertLibraryItem(input: {
  userId: string;
  arxivId: string;
  status?: ReadingStatus;
  notes?: string;
}) {
  await ensureSchema();
  const existing = await getLibraryItem(input.userId, input.arxivId);
  const now = new Date();

  if (existing) {
    await db
      .update(libraryItems)
      .set({
        status: input.status ?? existing.status,
        notes: input.notes ?? existing.notes,
        updatedAt: now,
      })
      .where(eq(libraryItems.id, existing.id));
    return { ...existing, status: input.status ?? existing.status, notes: input.notes ?? existing.notes };
  }

  const item = {
    id: nanoid(),
    userId: input.userId,
    arxivId: input.arxivId,
    status: input.status ?? "queued",
    notes: input.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(libraryItems).values(item);
  return item;
}

export async function removeLibraryItem(userId: string, arxivId: string) {
  await ensureSchema();
  await db
    .delete(libraryItems)
    .where(and(eq(libraryItems.userId, userId), eq(libraryItems.arxivId, arxivId)));
}

export async function getCollections(userId: string) {
  await ensureSchema();
  await ensureCollectionSlugs(userId);
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(desc(collections.createdAt));
  if (!rows.length) return [];

  const papers = await db.query.collectionPapers.findMany({
    where: inArray(
      collectionPapers.collectionId,
      rows.map((row) => row.id),
    ),
  });

  const byCollection = new Map<string, string[]>();
  for (const row of papers) {
    const existing = byCollection.get(row.collectionId);
    if (existing) existing.push(row.arxivId);
    else byCollection.set(row.collectionId, [row.arxivId]);
  }

  return rows.map((collection) => ({
    ...collection,
    paperIds: byCollection.get(collection.id) ?? [],
  }));
}

export async function getCollectionBySlug(userId: string, slug: string) {
  const all = await getCollections(userId);
  return all.find((collection) => collection.slug === slug);
}

async function ensureCollectionSlugs(userId: string) {
  const rows = await db.query.collections.findMany({
    where: eq(collections.userId, userId),
  });
  const taken = new Set(rows.map((row) => row.slug).filter(Boolean));

  for (const row of rows) {
    if (row.slug) continue;
    const slug = uniqueSlug(row.name, taken);
    taken.add(slug);
    await db.update(collections).set({ slug }).where(eq(collections.id, row.id));
  }
}

function uniqueSlug(name: string, taken: Set<string>) {
  const base = slugify(name);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function createCollection(userId: string, name: string, description = "") {
  await ensureSchema();
  await ensureCollectionSlugs(userId);
  const existing = await db.query.collections.findMany({
    where: eq(collections.userId, userId),
  });
  const taken = new Set(existing.map((row) => row.slug).filter(Boolean));
  const collection = {
    id: nanoid(),
    userId,
    name: name.trim() || "Untitled collection",
    slug: uniqueSlug(name.trim() || "Untitled collection", taken),
    description,
    createdAt: new Date(),
  };
  await db.insert(collections).values(collection);
  return collection;
}

export async function addToCollection(userId: string, collectionId: string, arxivId: string) {
  await ensureSchema();
  await ensureCollectionSlugs(userId);
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
  });
  if (!collection) throw new Error("Collection not found");
  await db
    .insert(collectionPapers)
    .values({ collectionId, arxivId, addedAt: new Date() })
    .onConflictDoNothing();
  return collection;
}

export async function removeFromCollection(userId: string, collectionId: string, arxivId: string) {
  await ensureSchema();
  await ensureCollectionSlugs(userId);
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
  });
  if (!collection) throw new Error("Collection not found");
  await db
    .delete(collectionPapers)
    .where(
      and(eq(collectionPapers.collectionId, collectionId), eq(collectionPapers.arxivId, arxivId)),
    );
  return collection;
}

export async function renameCollection(userId: string, collectionId: string, name: string) {
  await ensureSchema();
  await ensureCollectionSlugs(userId);
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
  });
  if (!collection) throw new Error("Collection not found");

  const trimmed = name.trim() || "Untitled collection";
  const existing = await db.query.collections.findMany({
    where: eq(collections.userId, userId),
  });
  const taken = new Set(
    existing
      .filter((row) => row.id !== collectionId)
      .map((row) => row.slug)
      .filter(Boolean),
  );
  const slug = uniqueSlug(trimmed, taken);

  await db
    .update(collections)
    .set({ name: trimmed, slug })
    .where(eq(collections.id, collectionId));

  return { previousSlug: collection.slug, ...collection, name: trimmed, slug };
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
  await ensureSchema();
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.shareToken, token))
    .limit(1);
  if (!collection?.shareToken) return null;

  const papers = await db.query.collectionPapers.findMany({
    where: eq(collectionPapers.collectionId, collection.id),
  });

  return {
    ...collection,
    paperIds: papers.map((row) => row.arxivId),
  };
}

export async function publishCollection(userId: string, collectionId: string) {
  await ensureSchema();
  const [collection] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)))
    .limit(1);
  if (!collection) throw new Error("Collection not found");
  if (collection.shareToken) return collection;

  const shareToken = await uniqueShareToken();
  await db.update(collections).set({ shareToken }).where(eq(collections.id, collectionId));
  return { ...collection, shareToken };
}

export async function unpublishCollection(userId: string, collectionId: string) {
  await ensureSchema();
  const [collection] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)))
    .limit(1);
  if (!collection) throw new Error("Collection not found");

  const previousShareToken = collection.shareToken;
  await db.update(collections).set({ shareToken: null }).where(eq(collections.id, collectionId));
  return { ...collection, previousShareToken, shareToken: null };
}

export async function deleteCollection(userId: string, collectionId: string) {
  await ensureSchema();
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
  });
  if (!collection) throw new Error("Collection not found");

  await db.delete(collectionPapers).where(eq(collectionPapers.collectionId, collectionId));
  await db
    .delete(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)));

  return collection;
}
