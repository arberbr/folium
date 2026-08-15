import { XMLParser } from "fast-xml-parser";
import type { ArxivAuthor, ArxivPaper, ArxivSearchResult } from "./types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["entry", "author", "category", "link"].includes(name),
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function extractId(raw: string) {
  const match = raw.match(/arxiv\.org\/abs\/(.+)$/);
  const id = match?.[1] ?? raw.split("/").pop() ?? raw;
  return id.replace(/v\d+$/, "");
}

function extractVersion(raw: string) {
  const match = raw.match(/v(\d+)$/);
  return match ? `v${match[1]}` : null;
}

export function parseArxivFeed(xml: string): ArxivSearchResult {
  const parsed = parser.parse(xml) as {
    feed?: {
      "opensearch:totalResults"?: number | string;
      "opensearch:startIndex"?: number | string;
      "opensearch:itemsPerPage"?: number | string;
      entry?: unknown[];
    };
  };

  const feed = parsed.feed ?? {};
  const entries = asArray(feed.entry);

  const papers = entries.map((entry) => mapEntry(entry as Record<string, unknown>));

  return {
    papers,
    total: Number(feed["opensearch:totalResults"] ?? papers.length),
    start: Number(feed["opensearch:startIndex"] ?? 0),
    maxResults: Number(feed["opensearch:itemsPerPage"] ?? papers.length),
  };
}

function mapEntry(entry: Record<string, unknown>): ArxivPaper {
  const idRaw = cleanText(entry.id);
  const id = extractId(idRaw);
  const links = asArray(entry.link as Record<string, string>[] | undefined);
  const pdfLink = links.find(
    (link) => link["@_title"] === "pdf" || link["@_type"] === "application/pdf",
  );
  const authors = asArray(
    entry.author as { name?: string; "arxiv:affiliation"?: string }[] | undefined,
  ).map(
    (author): ArxivAuthor => ({
      name: cleanText(author.name),
      affiliation: author["arxiv:affiliation"] ? cleanText(author["arxiv:affiliation"]) : undefined,
    }),
  );

  const categories = asArray(entry.category as { "@_term"?: string }[] | undefined)
    .map((category) => category["@_term"])
    .filter((term): term is string => Boolean(term));

  const primary =
    (entry["arxiv:primary_category"] as { "@_term"?: string } | undefined)?.["@_term"] ??
    categories[0] ??
    "cs.AI";

  return {
    id,
    version: extractVersion(idRaw),
    title: cleanText(entry.title),
    summary: cleanText(entry.summary),
    authors,
    categories: categories.length ? categories : [primary],
    primaryCategory: primary,
    published: cleanText(entry.published),
    updated: cleanText(entry.updated),
    comment: entry["arxiv:comment"] ? cleanText(entry["arxiv:comment"]) : undefined,
    journalRef: entry["arxiv:journal_ref"] ? cleanText(entry["arxiv:journal_ref"]) : undefined,
    doi: entry["arxiv:doi"] ? cleanText(entry["arxiv:doi"]) : undefined,
    pdfUrl: pdfLink?.["@_href"] ?? `https://arxiv.org/pdf/${id}.pdf`,
    absUrl: `https://arxiv.org/abs/${id}`,
    htmlUrl: `https://ar5iv.labs.arxiv.org/html/${id}`,
  };
}
