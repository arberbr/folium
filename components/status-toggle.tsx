"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updatePaperStatusAction } from "@/lib/actions";
import type { ReadingStatus } from "@/lib/db/schema";

const OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: "queued", label: "Queue" },
  { value: "reading", label: "Reading" },
  { value: "done", label: "Read" },
  { value: "skipped", label: "Skip" },
];

export function StatusToggle({
  arxivId,
  status,
}: {
  arxivId: string;
  status: ReadingStatus | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
        <ToggleGroup
      type="single"
      value={status ?? ""}
      onValueChange={(value) => {
        if (!value) return;
        startTransition(async () => {
          try {
            await updatePaperStatusAction(arxivId, value as ReadingStatus);
            const option = OPTIONS.find((item) => item.value === value);
            toast.success(option ? `Marked as ${option.label}` : "Status updated");
          } catch {
            toast.error("Could not update status");
          }
        });
      }}
      variant="outline"
      size="default"
      disabled={pending}
      spacing={0}
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
