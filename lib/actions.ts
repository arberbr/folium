"use server";

import {
  clearOpenRouterKey,
  DISCONNECTED,
  getOpenRouterConnection,
  type OpenRouterConnection,
  saveOpenRouterKey,
} from "@/lib/ai/openrouter";
import { requireUserId } from "@/lib/auth";
import {
  addToCollection,
  createCollection,
  deleteCollection,
  publishCollection,
  removeFromCollection,
  removeLibraryItem,
  renameCollection,
  unpublishCollection,
  updateInterests,
  upsertLibraryItem,
} from "@/lib/data/user";
import { ActionError, asAction } from "@/lib/errors";
import {
  revalidateCollection,
  revalidateInterests,
  revalidateLibraryPaper,
  revalidatePaper,
  revalidatePaperPages,
} from "@/lib/revalidate";
import {
  arxivIdSchema,
  collectionIdSchema,
  collectionNameSchema,
  interestsSchema,
  openRouterKeySchema,
  parseWith,
  readingStatusSchema,
} from "@/lib/validations";

export async function savePaperAction(arxivId: string, status = "queued") {
  return asAction(async () => {
    const userId = await requireUserId();
    const id = parseWith(arxivIdSchema, arxivId);
    const nextStatus = parseWith(readingStatusSchema, status);
    await upsertLibraryItem({ userId, arxivId: id, status: nextStatus });
    revalidateLibraryPaper(id);
  });
}

export async function updatePaperStatusAction(arxivId: string, status: string) {
  return savePaperAction(arxivId, status);
}

export async function removePaperAction(arxivId: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const id = parseWith(arxivIdSchema, arxivId);
    await removeLibraryItem(userId, id);
    revalidateLibraryPaper(id);
  });
}

export async function createShelfAction(name: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const collection = await createCollection(userId, parseWith(collectionNameSchema, name));
    revalidateCollection(collection);
  });
}

export async function addToShelfAction(collectionId: string, arxivId: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const id = parseWith(arxivIdSchema, arxivId);
    const shelfId = parseWith(collectionIdSchema, collectionId);
    const collection = await addToCollection(userId, shelfId, id);
    revalidatePaper(id);
    revalidateCollection(collection);
  });
}

export async function removeFromShelfAction(collectionId: string, arxivId: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const id = parseWith(arxivIdSchema, arxivId);
    const shelfId = parseWith(collectionIdSchema, collectionId);
    const collection = await removeFromCollection(userId, shelfId, id);
    revalidatePaper(id);
    revalidateCollection(collection);
  });
}

export async function publishCollectionAction(collectionId: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const collection = await publishCollection(userId, parseWith(collectionIdSchema, collectionId));
    if (!collection.shareToken) throw new ActionError("Could not publish this collection");
    revalidateCollection(collection);
    return { token: collection.shareToken };
  });
}

export async function unpublishCollectionAction(collectionId: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const collection = await unpublishCollection(
      userId,
      parseWith(collectionIdSchema, collectionId),
    );
    revalidateCollection(collection);
  });
}

export async function renameCollectionAction(collectionId: string, name: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const collection = await renameCollection(
      userId,
      parseWith(collectionIdSchema, collectionId),
      parseWith(collectionNameSchema, name),
    );
    revalidateCollection(collection);
    return { slug: collection.slug };
  });
}

export async function deleteCollectionAction(collectionId: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const collection = await deleteCollection(userId, parseWith(collectionIdSchema, collectionId));
    revalidateCollection(collection);
  });
}

export async function saveInterestsAction(interests: string[]) {
  return asAction(async () => {
    const userId = await requireUserId();
    await updateInterests(userId, parseWith(interestsSchema, interests));
    revalidateInterests();
  });
}

export async function getOpenRouterConnectionAction(): Promise<OpenRouterConnection> {
  const userId = await requireUserId();
  return getOpenRouterConnection(userId);
}

export async function saveOpenRouterKeyAction(key: string) {
  const userId = await requireUserId();
  const parsed = openRouterKeySchema.safeParse(key);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid key" };
  }
  const result = await saveOpenRouterKey(userId, parsed.data);
  if (result.ok) revalidatePaperPages();
  return result;
}

export async function disconnectOpenRouterAction() {
  return asAction(async () => {
    const userId = await requireUserId();
    await clearOpenRouterKey(userId);
    revalidatePaperPages();
    return DISCONNECTED;
  });
}
