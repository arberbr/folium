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

/** Adds the paper to the library. An item that is already there keeps the status it has. */
export async function savePaperAction(arxivId: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const id = parseWith(arxivIdSchema, arxivId);
    await upsertLibraryItem({ userId, arxivId: id });
    revalidateLibraryPaper(id);
  });
}

/** Sets the reading status, adding the paper to the library first if it is not there yet. */
export async function updatePaperStatusAction(arxivId: string, status: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const id = parseWith(arxivIdSchema, arxivId);
    const nextStatus = parseWith(readingStatusSchema, status);
    await upsertLibraryItem({ userId, arxivId: id, status: nextStatus });
    revalidateLibraryPaper(id);
  });
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

/** A read, not a mutation — no ActionError to catch, so no asAction envelope. */
export async function getOpenRouterConnectionAction(): Promise<OpenRouterConnection> {
  const userId = await requireUserId();
  return getOpenRouterConnection(userId);
}

export async function saveOpenRouterKeyAction(key: string) {
  return asAction(async () => {
    const userId = await requireUserId();
    const connection = await saveOpenRouterKey(userId, parseWith(openRouterKeySchema, key));
    revalidatePaperPages();
    return connection;
  });
}

export async function disconnectOpenRouterAction() {
  return asAction(async () => {
    const userId = await requireUserId();
    await clearOpenRouterKey(userId);
    revalidatePaperPages();
    return DISCONNECTED;
  });
}
