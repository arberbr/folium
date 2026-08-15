"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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

export function CreateShelfForm({ action }: { action: (name: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const filled = name.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setName("");
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-full min-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border bg-primary/8 p-5 text-center text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/14"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/15">
            <Plus className="size-5" />
          </span>
          <h2 className="font-heading text-xl">Add a collection</h2>
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Plus className="size-4" />
          </span>
          <DialogTitle>Add a collection</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) return;
            startTransition(async () => {
              try {
                await action(trimmed);
                setOpen(false);
                setName("");
                toast.success(`Created “${trimmed}”`);
              } catch {
                toast.error("Could not create this collection");
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="new-collection-name">Name</Label>
            <Input
              id="new-collection-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New collection name"
              autoFocus
            />
            <DialogDescription>Name it after a question you keep coming back to.</DialogDescription>
          </div>
          <DialogFooter>
            <ControlButton type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </ControlButton>
            <ControlButton type="submit" disabled={pending || !filled}>
              Add collection
            </ControlButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
