"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { ControlButton } from "@/components/control-button";
import { useServerAction } from "@/hooks/use-server-action";
import { removePaperAction, savePaperAction } from "@/lib/actions";

export function SaveButton({ arxivId, saved }: { arxivId: string; saved: boolean }) {
  const [isSaved, setIsSaved] = useState(saved);
  const { pending, run } = useServerAction();

  return (
    <ControlButton
      variant={isSaved ? "secondary" : "outline"}
      disabled={pending}
      onClick={() => {
        if (isSaved) {
          run({
            action: () => removePaperAction(arxivId),
            success: "Removed from the library",
            error: "Could not update the library",
            onSuccess: () => setIsSaved(false),
          });
          return;
        }
        run({
          action: () => savePaperAction(arxivId),
          success: "Saved to your library",
          error: "Could not update the library",
          onSuccess: () => setIsSaved(true),
        });
      }}
    >
      {isSaved ? <BookmarkCheck /> : <Bookmark />}
      {isSaved ? "Saved" : "Save"}
    </ControlButton>
  );
}
