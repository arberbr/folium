import type { ReactNode } from "react";
import { pluralize } from "@/lib/format";

export function MissingPapersNotice({ missing }: { missing: number }) {
  if (missing <= 0) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {pluralize(missing, "paper")} could not be loaded from arXiv right now.
    </p>
  );
}

/** The one place the paper column count is decided. Skeletons use it too, so a loading grid never drifts from the loaded one. */
export function PaperGrid({ children }: { children: ReactNode }) {
  return <section className="grid gap-5 md:grid-cols-2">{children}</section>;
}
