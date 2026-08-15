/** Strip an optional `id:` prefix and version suffix (`v1`). */
export function normalizeArxivId(raw: string) {
  return raw.trim().replace(/^id:\s*/i, "").replace(/v\d+$/i, "").trim();
}

/**
 * Modern `YYMM.NNNNN` ids, or pre-2007 `archive/YYMMNNN` ids (`cond-mat/0206368`,
 * `math.GT/0309136`). The arXiv API's `id:` search field does not match the
 * latter — those have to go through `id_list`.
 */
export function isArxivId(raw: string) {
  const id = normalizeArxivId(raw);
  return /^\d{4}\.\d{4,5}$/.test(id) || /^[a-z-]+(?:\.[a-z-]+)?\/\d{7}$/i.test(id);
}

export function arxivIdFromRoute(segments: string | string[]) {
  const joined = Array.isArray(segments) ? segments.join("/") : segments;
  return normalizeArxivId(decodeURIComponent(joined));
}
