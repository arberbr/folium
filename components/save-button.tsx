"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { ControlButton } from "@/components/control-button";
import { useServerAction } from "@/hooks/use-server-action";
import { removePaperAction, savePaperAction } from "@/lib/actions";

/**
 * Reads `saved` straight from the server on every render rather than seeding
 * local state from it: StatusToggle sits next to this button and can add the
 * paper to the library on its own, and a latched copy would keep saying "Save"
 * for a paper that is already saved.
 */
export function SaveButton({ arxivId, saved }: { arxivId: string; saved: boolean }) {
  const { pending, run } = useServerAction();

  return (
    <ControlButton
      variant={saved ? "secondary" : "outline"}
      disabled={pending}
      onClick={() => {
        run({
          action: () => (saved ? removePaperAction(arxivId) : savePaperAction(arxivId)),
          success: saved ? "Removed from the library" : "Saved to your library",
          error: "Could not update the library",
        });
      }}
    >
      {saved ? <BookmarkCheck /> : <Bookmark />}
      {saved ? "Saved" : "Save"}
    </ControlButton>
  );
}
