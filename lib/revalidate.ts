import { revalidatePath } from "next/cache";
import { collectionHref, paperHref, shareHref } from "@/lib/format";

export function revalidatePaper(arxivId: string) {
  revalidatePath(paperHref(arxivId));
}

export function revalidateLibraryPaper(arxivId: string) {
  revalidatePath("/library");
  revalidatePaper(arxivId);
}

export function revalidatePaperPages() {
  revalidatePath("/paper/[...id]", "page");
}

export function revalidateCollection(collection: {
  slug: string;
  previousSlug?: string;
  shareToken?: string | null;
  previousShareToken?: string | null;
}) {
  revalidatePath("/collections");
  revalidatePath(collectionHref(collection.slug));
  if (collection.previousSlug) {
    revalidatePath(collectionHref(collection.previousSlug));
  }
  if (collection.shareToken) {
    revalidatePath(shareHref(collection.shareToken));
  }
  if (collection.previousShareToken) {
    revalidatePath(shareHref(collection.previousShareToken));
  }
}

export function revalidateInterests() {
  revalidatePath("/today");
  revalidatePath("/settings");
}
