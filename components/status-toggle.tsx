"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useServerAction } from "@/hooks/use-server-action";
import { updatePaperStatusAction } from "@/lib/actions";
import { type ReadingStatus, readingStatuses } from "@/lib/db/schema";
import { READING_STATUS_LABEL } from "@/lib/reading-status";

const OPTIONS = readingStatuses.map((value) => ({
  value,
  label: READING_STATUS_LABEL[value],
}));

export function StatusToggle({
  arxivId,
  status,
}: {
  arxivId: string;
  status: ReadingStatus | null;
}) {
  const { pending, run } = useServerAction();

  return (
    <ToggleGroup
      type="single"
      value={status ?? ""}
      onValueChange={(value) => {
        if (!value) return;
        const option = OPTIONS.find((item) => item.value === value);
        run({
          action: () => updatePaperStatusAction(arxivId, value),
          success: option ? `Marked as ${option.label}` : "Status updated",
          error: "Could not update status",
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
