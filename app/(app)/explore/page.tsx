import { auth } from "@clerk/nextjs/server";
import { CategoryPills } from "@/components/category-pills";
import { OffsetPager } from "@/components/offset-pager";
import { PaperCard } from "@/components/paper-card";
import { SearchBar } from "@/components/search-bar";
import { categoryLabel, FEATURED_CATEGORIES } from "@/lib/arxiv/categories";
import { searchArxiv } from "@/lib/arxiv/client";
import type { ArxivSearchResult } from "@/lib/arxiv/types";
import { getOrCreateProfile } from "@/lib/data/user";

const PAGE_SIZE = 20;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; start?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.cat?.trim() ?? "";
  const start = Number(params.start ?? 0) || 0;

  const profile = userId ? await getOrCreateProfile(userId) : null;
  const interests = profile?.interests.length
    ? profile.interests
    : FEATURED_CATEGORIES.map((item) => item.id);
  let result: ArxivSearchResult = { papers: [], total: 0, start, maxResults: PAGE_SIZE };
  let fetchError = false;
  try {
    result = await searchArxiv({
      query: query || undefined,
      category: category || undefined,
      categories: !category && !query ? interests : undefined,
      start,
      maxResults: PAGE_SIZE,
      sortBy: query ? "relevance" : "submittedDate",
    });
  } catch {
    fetchError = true;
  }

  const title = query ? `Results for “${query}”` : category ? categoryLabel(category) : "Explore";

  function hrefFor(nextStart: number) {
    const search = new URLSearchParams({
      ...(query ? { q: query } : {}),
      ...(category ? { cat: category } : {}),
      ...(nextStart ? { start: String(nextStart) } : {}),
    });
    const qs = search.toString();
    return qs ? `/explore?${qs}` : "/explore";
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-heading text-4xl sm:text-5xl">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {fetchError
            ? "arXiv did not return this slice. Try a field, an author, or a paper id."
            : `${result.total.toLocaleString()} papers in this slice of arXiv.`}
        </p>
        <SearchBar defaultQuery={query} defaultCategory={category} />
        <CategoryPills active={category} interests={interests} />
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {result.papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </section>

      <OffsetPager
        hrefFor={hrefFor}
        start={start}
        pageSize={PAGE_SIZE}
        itemCount={result.papers.length}
        total={result.total}
      />
    </div>
  );
}
