"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  clearOpenRouterKey,
  DISCONNECTED,
  getOpenRouterConnection,
  type OpenRouterConnection,
  saveOpenRouterKey,
} from "@/lib/ai/openrouter";
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
import type { ReadingStatus } from "@/lib/db/schema";
import { collectionHref, shareHref } from "@/lib/format";

async function requireUserId() {
  const { userId } = await auth.protect();
  return userId;
}

export async function savePaperAction(arxivId: string, status: ReadingStatus = "queued") {
  const userId = await requireUserId();
  await upsertLibraryItem({ userId, arxivId, status });
  revalidatePath("/library");
  revalidatePath(`/paper/${encodeURIComponent(arxivId)}`);
}

export async function updatePaperStatusAction(arxivId: string, status: ReadingStatus) {
  const userId = await requireUserId();
  await upsertLibraryItem({ userId, arxivId, status });
  revalidatePath("/library");
  revalidatePath(`/paper/${encodeURIComponent(arxivId)}`);
}

export async function removePaperAction(arxivId: string) {
  const userId = await requireUserId();
  await removeLibraryItem(userId, arxivId);
  revalidatePath("/library");
  revalidatePath(`/paper/${encodeURIComponent(arxivId)}`);
}

export async function createShelfAction(name: string) {
  const userId = await requireUserId();
  const collection = await createCollection(userId, name);
  revalidatePath("/collections");
  revalidatePath(collectionHref(collection.slug));
}

export async function addToShelfAction(collectionId: string, arxivId: string) {
  const userId = await requireUserId();
  const collection = await addToCollection(userId, collectionId, arxivId);
  revalidatePath("/collections");
  revalidatePath(`/paper/${encodeURIComponent(arxivId)}`);
  revalidatePath(collectionHref(collection.slug));
}

export async function removeFromShelfAction(collectionId: string, arxivId: string) {
  const userId = await requireUserId();
  const collection = await removeFromCollection(userId, collectionId, arxivId);
  revalidatePath("/collections");
  revalidatePath(`/paper/${encodeURIComponent(arxivId)}`);
  revalidatePath(collectionHref(collection.slug));
}

export async function publishCollectionAction(collectionId: string) {
  const userId = await requireUserId();
  const collection = await publishCollection(userId, collectionId);
  if (!collection.shareToken) throw new Error("Could not publish this collection");
  revalidatePath("/collections");
  revalidatePath(collectionHref(collection.slug));
  revalidatePath(shareHref(collection.shareToken));
  return { token: collection.shareToken };
}

export async function unpublishCollectionAction(collectionId: string) {
  const userId = await requireUserId();
  const collection = await unpublishCollection(userId, collectionId);
  revalidatePath("/collections");
  revalidatePath(collectionHref(collection.slug));
  if (collection.previousShareToken) {
    revalidatePath(shareHref(collection.previousShareToken));
  }
}

export async function renameCollectionAction(collectionId: string, name: string) {
  const userId = await requireUserId();
  const collection = await renameCollection(userId, collectionId, name);
  revalidatePath("/collections");
  revalidatePath(collectionHref(collection.previousSlug));
  revalidatePath(collectionHref(collection.slug));
  return { slug: collection.slug };
}

export async function deleteCollectionAction(collectionId: string) {
  const userId = await requireUserId();
  const collection = await deleteCollection(userId, collectionId);
  revalidatePath("/collections");
  revalidatePath(collectionHref(collection.slug));
  if (collection.shareToken) {
    revalidatePath(shareHref(collection.shareToken));
  }
}

export async function saveInterestsAction(interests: string[]) {
  const userId = await requireUserId();
  await updateInterests(userId, interests);
  revalidatePath("/today");
  revalidatePath("/settings");
}

export async function getOpenRouterConnectionAction(): Promise<OpenRouterConnection> {
  const userId = await requireUserId();
  return getOpenRouterConnection(userId);
}

export async function saveOpenRouterKeyAction(key: string) {
  const userId = await requireUserId();
  const result = await saveOpenRouterKey(userId, key);
  if (result.ok) revalidatePath("/paper/[id]", "page");
  return result;
}

export async function disconnectOpenRouterAction() {
  const userId = await requireUserId();
  await clearOpenRouterKey(userId);
  revalidatePath("/paper/[id]", "page");
  return DISCONNECTED;
}
