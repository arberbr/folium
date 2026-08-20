import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { connection } from "next/server";
import { ControlButton } from "@/components/control-button";
import { Latex } from "@/components/latex";
import { PageShell } from "@/components/site-header";
import { searchArxiv } from "@/lib/arxiv/client";
import { toPlainText } from "@/lib/arxiv/latex";
import { formatAuthors, paperHref } from "@/lib/format";
import { cn, sample } from "@/lib/utils";

function SampleCard({
  title,
  authors,
  linked = false,
}: {
  title: string;
  authors: string;
  linked?: boolean;
}) {
  return (
    <article
      className={cn(
        "rotate-[-1.5deg] rounded-2xl border border-border/80 bg-card/90 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)]",
        linked &&
          "transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-0.5deg]",
      )}
    >
      <p className="font-mono text-[11px] tracking-wide text-primary">cs.LG · just in</p>
      <h2 className="font-heading mt-3 text-2xl leading-snug">
        <Latex>{title}</Latex>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{authors}</p>
    </article>
  );
}

export default async function LandingPage() {
  // arXiv announces in daily weekday batches, so "the newest cs.LG paper" is
  // the same string for ~24h at a time. Pull the whole latest batch and show a
  // different one per request, so the card reads as live rather than frozen.
  await connection();

  // Raw title: the card renders it through <Latex>, same as PaperCard does.
  let sampleTitle = "Attention Is All You Need";
  let sampleAuthors = "Vaswani et al.";
  // Stays null on the fallback: if arXiv is down there is nothing to link to,
  // and /paper would only fail the same way.
  let sampleHref: string | null = null;
  try {
    const latest = await searchArxiv({ category: "cs.LG", maxResults: 25 });
    const paper = sample(latest.papers);
    if (paper) {
      sampleTitle = paper.title;
      sampleAuthors = formatAuthors(paper.authors, 2);
      sampleHref = paperHref(paper.id);
    }
  } catch {
    // arXiv may be briefly unavailable; the landing still stands.
  }

  return (
    <PageShell>
      {/*
        The sample card is rotated and carries a wide shadow, so it paints ~13px past its own box:
        about 5px of rotated corner plus 8px of shadow. Plain `overflow-hidden` shaved both off at
        the gutter. `clip` still refuses to scroll — which is what kept the reveal animation from
        flashing a scrollbar — while the clip margin lets those 13px through.
      */}
      <main className="relative flex-1 overflow-clip [overflow-clip-margin:16px]">
        <section className="flex flex-col items-center py-20 text-center lg:py-28">
          <h1 className="font-heading reveal reveal-delay-1 max-w-3xl text-5xl leading-[1.05] text-pretty sm:text-7xl">
            Read less.
            <br />
            Learn more.
          </h1>
          <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            arXivDesk is your desk for arXiv: a daily drop from the fields you actually work in,
            saved and organized in one place.
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex justify-center">
            <Show when="signed-out">
              <ControlButton asChild size="lg">
                <Link href="/sign-up">Open the desk</Link>
              </ControlButton>
            </Show>
            <Show when="signed-in">
              <ControlButton asChild size="lg">
                <Link href="/today">Continue to Today</Link>
              </ControlButton>
            </Show>
          </div>

          <aside className="reveal reveal-delay-2 relative mt-16 w-full max-w-md text-left">
            {sampleHref ? (
              <Link
                href={sampleHref}
                aria-label={`Open ${toPlainText(sampleTitle)}`}
                className="group block rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
              >
                <SampleCard title={sampleTitle} authors={sampleAuthors} linked />
              </Link>
            ) : (
              <SampleCard title={sampleTitle} authors={sampleAuthors} />
            )}
          </aside>
        </section>
      </main>
    </PageShell>
  );
}
