"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { ControlButton } from "@/components/control-button";
import { removePaperAction, savePaperAction } from "@/lib/actions";

export function SaveButton({
  arxivId,
  saved,
}: {
  arxivId: string;
  saved: boolean;
}) {
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, startTransition] = useTransition();

  return (
    <ControlButton
      variant={isSaved ? "secondary" : "outline"}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            if (isSaved) {
              await removePaperAction(arxivId);
              setIsSaved(false);
              toast("Removed from the library");
            } else {
              await savePaperAction(arxivId);
              setIsSaved(true);
              toast("Saved to your library");
            }
          } catch {
            toast.error("Could not update the library");
          }
        });
      }}
    >
      {isSaved ? <BookmarkCheck /> : <Bookmark />}
      {isSaved ? "Saved" : "Save"}
    </ControlButton>
  );
}
