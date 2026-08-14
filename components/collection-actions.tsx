"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteCollectionAction, renameCollectionAction } from "@/lib/actions";
import { collectionHref } from "@/lib/format";

export type CollectionActionsProps = {
  collectionId: string;
  name: string;
};

export function CollectionActions({
  collectionId,
  name,
}: CollectionActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(name);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          setRenameOpen(open);
          if (open) setTitle(name);
        }}
      >
        <DialogTrigger asChild>
          <ControlButton variant="outline">Rename</ControlButton>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader className="flex-row items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Pencil className="size-4" />
            </span>
            <DialogTitle>Rename collection</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                try {
                  const result = await renameCollectionAction(collectionId, title);
                  setRenameOpen(false);
                  toast("Collection renamed");
                  router.push(collectionHref(result.slug));
                  router.refresh();
                } catch {
                  toast.error("Could not rename this collection");
                }
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="collection-name">Name</Label>
              <Input
                id="collection-name"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoFocus
              />
              <DialogDescription>
                The URL updates to match the new name.
              </DialogDescription>
            </div>
            <DialogFooter>
              <ControlButton type="button" variant="outline" onClick={() => setRenameOpen(false)}>
                Cancel
              </ControlButton>
              <ControlButton type="submit" disabled={pending || !title.trim()}>
                Save name
              </ControlButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <ControlButton variant="destructive">Delete</ControlButton>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader className="flex-row items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="size-4" />
            </span>
            <DialogTitle>Delete this collection?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            “{name}” will be removed. Papers stay in your library.
          </DialogDescription>
          <DialogFooter>
            <ControlButton type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </ControlButton>
            <ControlButton
              variant="destructive"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await deleteCollectionAction(collectionId);
                    setDeleteOpen(false);
                    toast("Collection deleted");
                    router.push("/library");
                    router.refresh();
                  } catch {
                    toast.error("Could not delete this collection");
                  }
                });
              }}
            >
              Delete
            </ControlButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
