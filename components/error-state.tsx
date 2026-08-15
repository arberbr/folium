"use client";

import Link from "next/link";
import { ControlButton } from "@/components/control-button";

/**
 * Copy and recovery actions shared by both error boundaries. Each boundary
 * supplies its own wrapper: the root one centres this in the viewport, the app
 * one renders it inline under the site header.
 *
 * `retry()` re-fetches and re-renders the boundary's children — prefer it to
 * `reset()`, which only clears the error state (Next.js 16.3).
 */
export function ErrorState({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <>
      <h1 className="font-heading text-4xl">This folio could not be opened</h1>
      <p className="mt-3 text-muted-foreground">
        {error.message || "Something went wrong while rendering this page."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ControlButton size="lg" onClick={() => retry()}>
          Try again
        </ControlButton>
        <ControlButton asChild size="lg" variant="outline">
          <Link href="/explore">Back to Explore</Link>
        </ControlButton>
      </div>
    </>
  );
}
