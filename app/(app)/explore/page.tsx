import Link from "next/link";
import { CategoryPills } from "@/components/category-pills";
import { PaperCard } from "@/components/paper-card";
import { SearchBar } from "@/components/search-bar";
import { searchArxiv } from "@/lib/arxiv/client";
import { categoryLabel } from "@/lib/arxiv/categories";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/data/user";
import { ControlButton } from "@/components/control-button";
import type { ArxivSearchResult } from "@/lib/arxiv/types";

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
  let result: ArxivSearchResult = { papers: [], total: 0, start, maxResults: 20 };
  let fetchError = false;
  try {
    result = await searchArxiv({
      query: query || undefined,
      category: category || undefined,
      start,
      maxResults: 20,
      sortBy: query ? "relevance" : "submittedDate",
    });
  } catch {
    fetchError = true;
  }

  const nextStart = start + result.maxResults;
  const prevStart = Math.max(0, start - 20);
  const title = query
    ? `Results for “${query}”`
    : category
      ? categoryLabel(category)
      : "Explore";

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
        <CategoryPills active={category} interests={profile?.interests} />
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {result.papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </section>

      <div className="flex items-center justify-between">
        <ControlButton variant="outline" asChild disabled={start === 0}>
          <Link
            href={`/explore?${new URLSearchParams({
              ...(query ? { q: query } : {}),
              ...(category ? { cat: category } : {}),
              start: String(prevStart),
            }).toString()}`}
          >
            Previous
          </Link>
        </ControlButton>
        <ControlButton variant="outline" asChild>
          <Link
            href={`/explore?${new URLSearchParams({
              ...(query ? { q: query } : {}),
              ...(category ? { cat: category } : {}),
              start: String(nextStart),
            }).toString()}`}
          >
            Next
          </Link>
        </ControlButton>
      </div>
    </div>
  );
}
