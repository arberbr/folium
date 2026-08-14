"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  addToCollection,
  createCollection,
  deleteCollection,
  removeFromCollection,
  removeLibraryItem,
  renameCollection,
  updateInterests,
  upsertLibraryItem,
} from "@/lib/data/user";
import type { ReadingStatus } from "@/lib/db/schema";
import { collectionHref } from "@/lib/format";

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
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
  revalidatePath("/library");
  revalidatePath(collectionHref(collection.slug));
}

export async function addToShelfAction(collectionId: string, arxivId: string) {
  const userId = await requireUserId();
  const collection = await addToCollection(userId, collectionId, arxivId);
  revalidatePath("/library");
  revalidatePath(`/paper/${encodeURIComponent(arxivId)}`);
  revalidatePath(collectionHref(collection.slug));
}

export async function removeFromShelfAction(collectionId: string, arxivId: string) {
  const userId = await requireUserId();
  const collection = await removeFromCollection(userId, collectionId, arxivId);
  revalidatePath("/library");
  revalidatePath(collectionHref(collection.slug));
}

export async function renameCollectionAction(collectionId: string, name: string) {
  const userId = await requireUserId();
  const collection = await renameCollection(userId, collectionId, name);
  revalidatePath("/library");
  revalidatePath(collectionHref(collection.previousSlug));
  revalidatePath(collectionHref(collection.slug));
  return { slug: collection.slug };
}

export async function deleteCollectionAction(collectionId: string) {
  const userId = await requireUserId();
  const collection = await deleteCollection(userId, collectionId);
  revalidatePath("/library");
  revalidatePath(collectionHref(collection.slug));
}

export async function saveInterestsAction(interests: string[]) {
  const userId = await requireUserId();
  await updateInterests(userId, interests);
  revalidatePath("/today");
  revalidatePath("/settings");
}
