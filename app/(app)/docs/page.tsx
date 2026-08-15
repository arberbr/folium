import Link from "next/link";
import { FolioShot } from "@/components/folio-shot";
import { ControlButton } from "@/components/control-button";

export const metadata = {
  title: "Docs",
  description:
    "How Folium turns arXiv into a reading room: Explore, Today, briefings, and collections.",
};

const TOC = [
  { href: "#reading-room", n: "01", label: "The reading room" },
  { href: "#explore", n: "02", label: "Browse the stack" },
  { href: "#search", n: "03", label: "Search by claim" },
  { href: "#paper", n: "04", label: "Open a folio" },
  { href: "#desk", n: "05", label: "Your desk" },
  { href: "#key", n: "06", label: "Your model key" },
] as const;

export default function DocsPage() {
  return (
    <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
      <aside className="mb-10 lg:mb-0">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 space-y-1 text-sm">
          <p className="mb-3 text-[11px] tracking-[0.22em] text-primary uppercase">Folio</p>
          {TOC.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-baseline gap-3 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span className="font-mono text-[11px] text-primary">{item.n}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <article className="max-w-3xl space-y-16">
        <header className="space-y-4">
          <p className="text-xs tracking-[0.22em] text-primary uppercase">Field notes</p>
          <h1 className="font-heading text-4xl leading-tight sm:text-5xl">How Folium works</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            arXiv publishes a flood. Folium is the desk: a daily drop from the fields you follow, a
            search that does not require an account, and a briefing that tells you whether the PDF
            is worth the hour.
          </p>
        </header>

        <section id="reading-room" className="scroll-mt-24 space-y-5">
          <SectionHeading n="01" title="The reading room" />
          <p className="leading-relaxed text-pretty">
            The front door is public. Sign in when you want a personalized Today drop, a library,
            and live analysis. Until then you can still walk the stacks.
          </p>
          <FolioShot
            src="/folio/landing.png"
            alt="Folium landing page with the line Read less. Learn more. and a sample paper card."
            caption="The landing card is a live preprint from cs.LG — a different one on each visit, so the room never feels frozen."
            priority
          />
        </section>

        <section id="explore" className="scroll-mt-24 space-y-5">
          <SectionHeading n="02" title="Browse the stack" />
          <p className="leading-relaxed text-pretty">
            <Link href="/explore" className="text-primary underline-offset-4 hover:underline">
              Explore
            </Link>{" "}
            is open without an account. It searches arXiv directly: newest work across featured
            fields, or the categories you follow once you are signed in. Nothing here calls a
            language model, so browsing cannot spend anyone’s credits.
          </p>
          <FolioShot
            src="/folio/explore.png"
            alt="Explore page with a search bar, category pills, and a grid of recent arXiv papers."
            caption="Unsigned visitors see the featured computer-science fields. After you pick Interests, Explore defaults to that slice instead."
          />
        </section>

        <section id="search" className="scroll-mt-24 space-y-5">
          <SectionHeading n="03" title="Search by claim" />
          <p className="leading-relaxed text-pretty">
            Type a title fragment, an author, a method, or a raw arXiv id. Folium ranks by relevance
            when you search, and by submission date when you are just walking a category.
          </p>
          <FolioShot
            src="/folio/explore-search.png"
            alt="Explore search results for Attention Is All You Need."
            caption="Category pills stay on the query so you can pin a field without losing the search."
          />
        </section>

        <section id="paper" className="scroll-mt-24 space-y-5">
          <SectionHeading n="04" title="Open a folio" />
          <p className="leading-relaxed text-pretty">
            Every paper page is public — shared collections can link straight through. You get the
            abstract, a heuristic sketch of the claim, and neighbours in the stack. Saving, status,
            a live briefing, and “ask the abstract” wait for an account (and, for the AI, your own
            OpenRouter key).
          </p>
          <FolioShot
            src="/folio/paper.png"
            alt="Paper page for Attention Is All You Need, showing abstract, briefing panel, and ask-the-abstract chat."
            caption="Without a key, the briefing is a sketch from the abstract. With one, Folium extracts claims, methods, limitations, novelty, and who should actually read it."
          />
        </section>

        <section id="desk" className="scroll-mt-24 space-y-5">
          <SectionHeading n="05" title="Your desk" />
          <p className="leading-relaxed text-pretty">
            Sign in and the rest of the room unlocks. Interests feed Today. Saves land in Library
            with a status (queue, reading, done, skipped). Named collections can be shared as a
            link; the papers themselves stay readable to anyone who has it.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <DeskCard
              href="/today"
              kicker="Today"
              title="The drop"
              body="Newest preprints from the arXiv classes you follow, fifty at a time."
            />
            <DeskCard
              href="/library"
              kicker="Library"
              title="The pile, tamed"
              body="Everything you saved, with a reading status so the stack has a shape."
            />
            <DeskCard
              href="/collections"
              kicker="Collections"
              title="Named shelves"
              body="Group papers for a project, a course, or a thread you want to hand someone."
            />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Fields live under{" "}
            <Link href="/settings" className="text-primary underline-offset-4 hover:underline">
              Interests
            </Link>
            — every arXiv subject class, not just CS. Tomorrow’s drop follows whatever you tick.
          </p>
        </section>

        <section id="key" className="scroll-mt-24 space-y-5">
          <SectionHeading n="06" title="Bring your own key" />
          <p className="leading-relaxed text-pretty">
            Folium does not hold a model-provider key. Open your avatar → Integrations, paste an{" "}
            <a
              href="https://openrouter.ai/keys"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              OpenRouter
            </a>{" "}
            key, and analyses run on your account. The AI routes stay behind sign-in on purpose: an
            anonymous visitor cannot spend another reader’s credits.
          </p>
          <div className="rounded-2xl border border-border/80 bg-card/40 p-6">
            <p className="text-xs tracking-[0.22em] text-primary uppercase">What the key unlocks</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li>
                <span className="font-medium">Live briefing</span> — TL;DR, audience, claims,
                methods, limitations, why it matters.
              </li>
              <li>
                <span className="font-medium">Ask the abstract</span> — a chat grounded in the paper
                you have open. If the PDF is required, Folium will say so.
              </li>
              <li>
                <span className="font-medium">Heuristic fallback</span> — without a key you still
                get a sketch from the abstract, never a blank page.
              </li>
            </ul>
          </div>
        </section>

        <footer className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-8">
          <ControlButton asChild size="lg">
            <Link href="/explore">Open Explore</Link>
          </ControlButton>
          <ControlButton asChild size="lg" variant="outline">
            <Link href="/today">Go to Today</Link>
          </ControlButton>
        </footer>
      </article>
    </div>
  );
}

function SectionHeading({ n, title }: { n: string; title: string }) {
  return (
    <h2 className="font-heading flex items-baseline gap-4 text-3xl">
      <span className="font-mono text-sm tracking-wide text-primary">{n}</span>
      {title}
    </h2>
  );
}

function DeskCard({
  href,
  kicker,
  title,
  body,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-border/80 bg-card/50 p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:ring-primary/40"
    >
      <p className="text-[11px] tracking-[0.2em] text-primary uppercase">{kicker}</p>
      <h3 className="font-heading mt-2 text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </Link>
  );
}
