import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Figtree, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
    default: "Folium — a private reading room for arXiv",
    template: "%s · Folium",
  },
  description:
    "Cut through the preprint stack. Folium turns arXiv into a personal observatory: briefings, collections, and conversations grounded in the abstract.",
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
          }}
        >
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}