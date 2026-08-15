"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ControlButton } from "@/components/control-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const fromCollection = Boolean(collection);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ControlButton
          type="button"
          variant="ghost"
          size="icon"
          className="pointer-events-auto size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={
            fromCollection
              ? `Remove ${title} from ${collection?.name}`
              : `Remove ${title} from library`
          }
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Trash2 />
        </ControlButton>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Trash2 className="size-4" />
          </span>
          <DialogTitle>
            {fromCollection ? "Remove from collection?" : "Remove from library?"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {fromCollection
            ? `“${title}” will leave ${collection?.name}. It stays in your library.`
            : `“${title}” will leave your library. You can save it again later.`}
        </DialogDescription>
        <DialogFooter>
          <ControlButton type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </ControlButton>
          <ControlButton
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                try {
                  if (collection) {
                    await removeFromShelfAction(collection.id, arxivId);
                    toast.success(`Removed from ${collection.name}`);
                  } else {
                    await removePaperAction(arxivId);
                    toast.success("Removed from the library");
                  }
                  setOpen(false);
                  router.refresh();
                } catch {
                  toast.error(
                    fromCollection
                      ? "Could not remove this paper from the collection"
                      : "Could not remove this paper",
                  );
                }
              });
            }}
          >
            Remove
          </ControlButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
