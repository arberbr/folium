import { formatDistanceToNow } from "date-fns";
import { normalizeArxivId } from "@/lib/arxiv/ids";

export function paperHref(id: string) {
  return `/paper/${normalizeArxivId(id).split("/").map(encodeURIComponent).join("/")}`;
}

export function collectionHref(slug: string) {
  return `/collection/${encodeURIComponent(slug)}`;
}

export function shareHref(token: string) {
  return `/shared/${encodeURIComponent(token)}`;
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "collection";
}

export function uniqueSlug(name: string, taken: Set<string>) {
  const base = slugify(name);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** "1 paper" / "3 papers". Only for nouns that pluralize by adding "s". */
export function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function formatAuthors(names: { name: string }[], limit = 3) {
  if (!names.length) return "Unknown authors";
  if (names.length <= limit) {
    return names.map((author) => author.name).join(", ");
  }
  return `${names
    .slice(0, limit)
    .map((author) => author.name)
    .join(", ")} +${names.length - limit}`;
}

export function formatPublished(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatExactDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
