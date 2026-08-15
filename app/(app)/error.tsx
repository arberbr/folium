"use client";

import { ErrorState } from "@/components/error-state";

export default function AppErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div>
      <ErrorState error={error} retry={retry} />
    </div>
  );
}
