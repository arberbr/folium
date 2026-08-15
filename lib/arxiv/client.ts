import { toPlainText } from "./latex";
import { isArxivId, normalizeArxivId } from "./ids";
import { parseArxivFeed } from "./parse";
import type { ArxivPaper, ArxivSearchParams, ArxivSearchResult } from "./types";

const ARXIV_API = "https://export.arxiv.org/api/query";
const USER_AGENT =
  process.env.ARXIV_USER_AGENT ??
  "arXivDesk/1.0 (https://github.com; arXiv research reading desk)";

function buildSearchQuery(params: ArxivSearchParams) {
  const clauses: string[] = [];

  if (params.category) {
    clauses.push(`cat:${params.category}`);
  }
  if (params.categories?.length) {
    const cats = params.categories.map((id) => `cat:${id}`).join(" OR ");
    clauses.push(params.categories.length > 1 ? `(${cats})` : cats);
  }
  if (params.author) {
    clauses.push(`au:"${params.author.replaceAll('"', "")}"`);
  }
  if (params.query) {
    const q = params.query.trim();
    if (q.startsWith("id:")) {
      clauses.push(`id:${q.slice(3).trim()}`);
    } else if (/^\d{4}\.\d{4,5}(v\d+)?$/.test(q)) {
      clauses.push(`id:${q}`);
    } else {
      clauses.push(`all:${q}`);
    }
  }

  // arXiv 500s on all:* — an unbounded wildcard is not a valid search.
  return clauses.length ? clauses.join(" AND ") : "cat:cs.*";
}

function resolveIdList(params: ArxivSearchParams) {
  if (params.idList?.length) {
    return params.idList.map(normalizeArxivId).filter(Boolean).join(",");
  }
  if (params.query && isArxivId(params.query)) {
    return normalizeArxivId(params.query);
  }
  return undefined;
}

export async function searchArxiv(
  params: ArxivSearchParams = {},
): Promise<ArxivSearchResult> {
  const url = new URL(ARXIV_API);
  const idList = resolveIdList(params);
  if (idList) {
    url.searchParams.set("id_list", idList);
  } else {
    url.searchParams.set("search_query", buildSearchQuery(params));
  }
  url.searchParams.set("start", String(params.start ?? 0));
  url.searchParams.set("max_results", String(params.maxResults ?? 20));
  url.searchParams.set("sortBy", params.sortBy ?? "submittedDate");
  url.searchParams.set("sortOrder", params.sortOrder ?? "descending");

  // force-cache is explicit on purpose: every page calls auth() before it gets
  // here, and the default `fetchCache: 'auto'` skips the cache for fetches
  // discovered after a request-time API.
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/atom+xml" },
    cache: "force-cache",
    next: { revalidate: 300, tags: ["arxiv"] },
  });

  if (!response.ok) {
    throw new Error(`arXiv request failed (${response.status})`);
  }

  const xml = await response.text();
  return parseArxivFeed(xml);
}

export async function getPaper(id: string): Promise<ArxivPaper | null> {
  const result = await searchArxiv({
    idList: [id],
    maxResults: 1,
  });
  return result.papers[0] ?? null;
}

export async function getPapersByIds(ids: string[]): Promise<ArxivPaper[]> {
  const unique = [...new Set(ids.filter(Boolean).map(normalizeArxivId))];
  if (!unique.length) return [];

  const result = await searchArxiv({
    idList: unique,
    maxResults: unique.length,
  });

  const byId = new Map(result.papers.map((paper) => [paper.id, paper]));
  return unique
    .map((id) => byId.get(id) ?? byId.get(id.replace(/v\d+$/, "")))
    .filter((paper): paper is ArxivPaper => Boolean(paper));
}

export async function relatedPapers(paper: ArxivPaper, limit = 8) {
  // Search on the flattened title — LaTeX delimiters are noise in a query.
  const terms = toPlainText(paper.title)
    .split(/[\s:;,.!?()[\]{}"“”]+/)
    .filter((word) => word.length > 4)
    .slice(0, 6)
    .join(" ");

  const [byCategory, byTerms] = await Promise.all([
    searchArxiv({
      category: paper.primaryCategory,
      maxResults: limit + 4,
      sortBy: "submittedDate",
    }),
    terms
      ? searchArxiv({
          query: terms,
          maxResults: limit,
          sortBy: "relevance",
        })
      : Promise.resolve({ papers: [], total: 0, start: 0, maxResults: 0 }),
  ]);

  const seen = new Set([paper.id]);
  const related: ArxivPaper[] = [];

  for (const candidate of [...byTerms.papers, ...byCategory.papers]) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    related.push(candidate);
    if (related.length >= limit) break;
  }

  return related;
}
