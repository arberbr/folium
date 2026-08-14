import { formatDistanceToNow } from "date-fns";

export function paperHref(id: string) {
  return `/paper/${encodeURIComponent(id)}`;
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
