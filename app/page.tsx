import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { PageShell } from "@/components/site-header";
import { ControlButton } from "@/components/control-button";
import { searchArxiv } from "@/lib/arxiv/client";
import { toPlainText } from "@/lib/arxiv/latex";
import { formatAuthors } from "@/lib/format";

export default async function LandingPage() {
  let sampleTitle = "Attention Is All You Need";
  let sampleAuthors = "Vaswani et al.";
  try {
    const latest = await searchArxiv({ category: "cs.LG", maxResults: 1 });
    const paper = latest.papers[0];
    if (paper) {
      sampleTitle = toPlainText(paper.title);
      sampleAuthors = formatAuthors(paper.authors, 2);
    }
  } catch {
    // arXiv may be briefly unavailable; the landing still stands.
  }

  return (
    <PageShell>
      <main className="relative flex-1 overflow-hidden">
        <section className="flex flex-col items-center py-20 text-center lg:py-28">
          <h1 className="font-heading reveal reveal-delay-1 mt-5 max-w-3xl text-5xl leading-[1.05] text-pretty sm:text-7xl">
            Read less.<br />Learn more.
          </h1>
          <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Folium is a reading room for arXiv: a daily drop from the fields you
            actually work in, structured briefings instead of another abstract
            dump.
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex justify-center">
            <Show when="signed-out">
              <ControlButton asChild size="lg">
                <Link href="/sign-up">Open the reading room</Link>
              </ControlButton>
            </Show>
            <Show when="signed-in">
              <ControlButton asChild size="lg">
                <Link href="/today">
                  Continue to Today
                </Link>
              </ControlButton>
            </Show>
          </div>

          <aside className="reveal reveal-delay-2 relative mt-16 w-full max-w-md text-left">
            <article className="rotate-[-1.5deg] rounded-2xl border border-border/80 bg-card/90 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)]">
              <p className="font-mono text-[11px] tracking-wide text-primary">cs.LG · just in</p>
              <h2 className="font-heading mt-3 text-2xl leading-snug">{sampleTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{sampleAuthors}</p>
              <div className="mt-6 space-y-2 text-sm">
                <p className="text-xs tracking-[0.2em] text-primary uppercase">Briefing</p>
                <p className="leading-relaxed">
                  Folium will extract the claim, the method, the limitation, and the
                  person who should actually read this — before you open the PDF.
                </p>
              </div>
            </article>
          </aside>
        </section>
      </main>
    </PageShell>
  );
}
