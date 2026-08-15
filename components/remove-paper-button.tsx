"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ControlButton } from "@/components/control-button";
import { useServerAction } from "@/hooks/use-server-action";
import { removeFromShelfAction, removePaperAction } from "@/lib/actions";

export function RemovePaperButton({
  arxivId,
  title,
  collection,
}: {
  arxivId: string;
  title: string;
  collection?: { id: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useServerAction();
  const fromCollection = Boolean(collection);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <ControlButton
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={
            fromCollection
              ? `Remove ${title} from ${collection?.name}`
              : `Remove ${title} from library`
          }
        >
          <Trash2 />
        </ControlButton>
      }
      icon={<Trash2 className="size-4" />}
      title={fromCollection ? "Remove from collection?" : "Remove from library?"}
      description={
        fromCollection
          ? `“${title}” will leave ${collection?.name}. It stays in your library.`
          : `“${title}” will leave your library. You can save it again later.`
      }
      confirmLabel="Remove"
      pending={pending}
      onConfirm={() => {
        run({
          action: () =>
            collection ? removeFromShelfAction(collection.id, arxivId) : removePaperAction(arxivId),
          success: collection ? `Removed from ${collection.name}` : "Removed from the library",
          error: fromCollection
            ? "Could not remove this paper from the collection"
            : "Could not remove this paper",
          onSuccess: () => setOpen(false),
        });
      }}
    />
  );
}
