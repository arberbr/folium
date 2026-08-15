import { auth } from "@clerk/nextjs/server";
import { OffsetPager } from "@/components/offset-pager";
import { PageHeader } from "@/components/page-header";
import { PaperCard } from "@/components/paper-card";
import { searchArxiv } from "@/lib/arxiv/client";
import type { ArxivSearchResult } from "@/lib/arxiv/types";
import { getOrCreateProfile } from "@/lib/data/user";

const PAGE_SIZE = 50;

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { userId } = await auth.protect();

  const params = await searchParams;
  const start = Number(params.start ?? 0) || 0;
  const profile = await getOrCreateProfile(userId);
  const interests = profile.interests.length ? profile.interests : ["cs.AI"];

  let result: ArxivSearchResult = { papers: [], total: 0, start, maxResults: PAGE_SIZE };
  let fetchError = false;
  try {
    result = await searchArxiv({
      categories: interests,
      start,
      maxResults: PAGE_SIZE,
    });
  } catch {
    fetchError = true;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Today" />

      {fetchError ? (
        <p className="text-sm text-muted-foreground">No preprints came back. Try again in a bit.</p>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2">
            {result.papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </section>

          <OffsetPager
            hrefFor={(next) => (next === 0 ? "/today" : `/today?start=${next}`)}
            start={start}
            pageSize={PAGE_SIZE}
            itemCount={result.papers.length}
            total={result.total}
          />
        </>
      )}
    </div>
  );
}
