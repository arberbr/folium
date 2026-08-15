"use client";

import Link from "next/link";
import { ControlButton } from "@/components/control-button";

export default function AppErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  retry: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-4xl">This folio could not be opened</h1>
      <p className="text-muted-foreground">
        {error.message || "Something went wrong while rendering this page."}
      </p>
      <div className="flex flex-wrap gap-3">
        <ControlButton onClick={() => retry()}>Try again</ControlButton>
        <ControlButton asChild variant="outline">
          <Link href="/explore">Back to Explore</Link>
        </ControlButton>
      </div>
    </div>
  );
}
