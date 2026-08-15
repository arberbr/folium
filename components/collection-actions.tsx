"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ControlButton } from "@/components/control-button";
import { ShareCollectionButton } from "@/components/share-collection-button";
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
import { useServerAction } from "@/hooks/use-server-action";
import { deleteCollectionAction, renameCollectionAction } from "@/lib/actions";
import { collectionHref } from "@/lib/format";

export type CollectionActionsProps = {
  collectionId: string;
  name: string;
  shareToken: string | null;
  origin: string;
};

export function CollectionActions({
  collectionId,
  name,
  shareToken,
  origin,
}: CollectionActionsProps) {
  const router = useRouter();
  const { pending, run } = useServerAction();
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
              run({
                action: () => renameCollectionAction(collectionId, title),
                success: "Collection renamed",
                error: "Could not rename this collection",
                refresh: false,
                onSuccess: (result) => {
                  setRenameOpen(false);
                  router.push(collectionHref(result.slug));
                  router.refresh();
                },
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
              <DialogDescription>The URL updates to match the new name.</DialogDescription>
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

      <ShareCollectionButton
        collectionId={collectionId}
        name={name}
        shareToken={shareToken}
        origin={origin}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        trigger={<ControlButton variant="destructive">Delete</ControlButton>}
        icon={<Trash2 className="size-4" />}
        title="Delete this collection?"
        description={`“${name}” will be removed. Papers stay in your library.`}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => {
          run({
            action: () => deleteCollectionAction(collectionId),
            success: "Collection deleted",
            error: "Could not delete this collection",
            refresh: false,
            onSuccess: () => {
              setDeleteOpen(false);
              router.push("/collections");
              router.refresh();
            },
          });
        }}
      />
    </div>
  );
}
