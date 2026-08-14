import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { PaperCard } from "@/components/paper-card";
import { ControlButton } from "@/components/control-button";
import { searchArxiv } from "@/lib/arxiv/client";
import { getOrCreateProfile } from "@/lib/data/user";
import type { ArxivSearchResult } from "@/lib/arxiv/types";

const PAGE_SIZE = 50;

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

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

  const nextStart = start + result.maxResults;
  const prevStart = Math.max(0, start - PAGE_SIZE);
  const hasNext = result.papers.length >= PAGE_SIZE && nextStart < result.total;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-heading text-4xl sm:text-5xl">Today</h1>
      </header>

      {fetchError ? (
        <p className="text-sm text-muted-foreground">
          No preprints came back. Try again in a bit.
        </p>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2">
            {result.papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </section>

          <div className="flex items-center justify-between">
            <ControlButton variant="outline" size="lg" asChild disabled={start === 0}>
              <Link href={start === 0 ? "/today" : `/today?start=${prevStart}`}>
                Previous
              </Link>
            </ControlButton>
            <ControlButton variant="outline" size="lg" asChild disabled={!hasNext}>
              <Link href={hasNext ? `/today?start=${nextStart}` : "/today"}>
                Next
              </Link>
            </ControlButton>
          </div>
        </>
      )}
    </div>
  );
}
