"use client";

import { ErrorState } from "@/components/error-state";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="text-xs tracking-[0.28em] text-primary uppercase">Error</p>
      <ErrorState error={error} retry={retry} />
    </div>
  );
}
