"use client";

import Link from "next/link";
import { ControlButton } from "@/components/control-button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  retry: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="text-xs tracking-[0.28em] text-primary uppercase">Error</p>
      <h1 className="font-heading mt-3 text-4xl">This folio could not be opened</h1>
      <p className="mt-3 text-muted-foreground">
        {error.message || "Something went wrong while rendering this page."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <ControlButton size="lg" onClick={() => retry()}>
          Try again
        </ControlButton>
        <ControlButton asChild size="lg" variant="outline">
          <Link href="/explore">Back to Explore</Link>
        </ControlButton>
      </div>
    </div>
  );
}
