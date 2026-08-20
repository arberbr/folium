import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Figtree, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "katex/dist/katex.min.css";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "arXivDesk — a private desk for arXiv",
    template: "%s · arXivDesk",
  },
  description:
    "Cut through the preprint stack. arXivDesk turns arXiv into a personal observatory: a daily drop and collections for the fields you follow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="grain constellation min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider
          appearance={{
            theme: shadcn,
            variables: {
              colorPrimary: "#0f7a72",
              borderRadius: "0.7rem",
              fontFamily: "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
            },
            // Clerk's borderRadius variable also drives its buttons and inputs, which already
            // match ours at 0.7rem. Only the panels need the rounded-xl of a paper card: Clerk
            // rounds them at borderRadius * 2 (1.4rem) against our * 1.4 (0.98rem).
            // The `!` is load-bearing. Clerk injects these radii through emotion, which only
            // wraps its output in a cascade layer when `cssLayerName` is set. Unlayered, they
            // outrank anything in Tailwind's `@layer utilities` no matter the specificity.
            // The popover is a 23.5rem card that Clerk clamps at `100vw - 2rem`, so on a phone it
            // lands on a 1rem gutter that misses the shell. Clerk anchors it bottom-end against
            // the avatar, which already sits on the right gutter, so matching the shell width
            // below md is all it takes to land both edges on the page grid.
            elements: {
              cardBox: "rounded-xl!",
              card: "rounded-xl!",
              popoverBox: "rounded-xl!",
              // Clerk's popover offset is fixed internally, so the extra breathing room under the
              // header comes from a margin. It positions with `top`, not a transform, so a margin
              // genuinely moves the card. `!` because CardRoot sets its own margin-block-start.
              userButtonPopoverCard:
                "rounded-xl! mt-[5px]! max-md:w-[calc(100vw_-_var(--shell-gutter)_*_2)]!",
            },
          }}
        >
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
