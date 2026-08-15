import type { ReactNode } from "react";

export function MissingPapersNotice({ missing }: { missing: number }) {
  if (missing <= 0) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {missing} paper{missing === 1 ? "" : "s"} could not be loaded from arXiv right now.
    </p>
  );
}

export function PaperGrid({ children }: { children: ReactNode }) {
  return <section className="grid gap-5 md:grid-cols-2">{children}</section>;
}
