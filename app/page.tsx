import type { ReactNode } from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { ArrowRight, Bookmark, Layers3, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site-header";
import { ControlButton } from "@/components/control-button";
import { searchArxiv } from "@/lib/arxiv/client";
import { formatAuthors } from "@/lib/format";

export default async function LandingPage() {
  let sampleTitle = "Attention Is All You Need";
  let sampleAuthors = "Vaswani et al.";
  try {
    const latest = await searchArxiv({ category: "cs.LG", maxResults: 1 });
    const paper = latest.papers[0];
    if (paper) {
      sampleTitle = paper.title;
      sampleAuthors = formatAuthors(paper.authors, 2);
    }
  } catch {
    // arXiv may be briefly unavailable; the landing still stands.
  }

  return (
    <PageShell>
      <main className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <section className="grid gap-16 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="reveal text-xs tracking-[0.28em] text-primary uppercase">
              A private observatory for the preprint stack
            </p>
            <h1 className="font-heading reveal reveal-delay-1 mt-5 max-w-3xl text-5xl leading-[1.05] text-pretty sm:text-7xl">
              Read less.<br />Learn more.
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Folium is a reading room for arXiv: a daily drop from the fields you
              actually work in, structured briefings instead of another abstract
              dump.
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
              <Show when="signed-out">
                <ControlButton asChild size="lg">
                  <Link href="/sign-up">
                    Open the reading room
                    <ArrowRight />
                  </Link>
                </ControlButton>
                <ControlButton asChild variant="outline" size="lg">
                  <Link href="/sign-in">I already have a desk</Link>
                </ControlButton>
              </Show>
              <Show when="signed-in">
                <ControlButton asChild size="lg">
                  <Link href="/today">
                    Continue to Today
                    <ArrowRight />
                  </Link>
                </ControlButton>
              </Show>
            </div>
          </div>

          <aside className="reveal reveal-delay-2 relative">
            <div className="absolute -left-6 top-10 hidden h-40 w-px bg-linear-to-b from-transparent via-primary/60 to-transparent lg:block" />
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

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/50 p-6">
      <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-primary">
        {icon}
      </div>
      <h3 className="font-heading mt-4 text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}
