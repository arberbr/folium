"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ControlButton } from "@/components/control-button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addToShelfAction, removeFromShelfAction } from "@/lib/actions";

export function AddToShelf({
  arxivId,
  shelves,
}: {
  arxivId: string;
  shelves: { id: string; name: string; paperIds: string[] }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [membership, setMembership] = useState(
    () => new Set(shelves.filter((shelf) => shelf.paperIds.includes(arxivId)).map((shelf) => shelf.id)),
  );

  if (!shelves.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ControlButton variant="outline" disabled={pending}>
          Add to collection
        </ControlButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {shelves.map((shelf) => {
          const checked = membership.has(shelf.id);
          return (
            <DropdownMenuCheckboxItem
              key={shelf.id}
              checked={checked}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(next) => {
                const shouldAdd = next === true;
                setMembership((current) => {
                  const updated = new Set(current);
                  if (shouldAdd) updated.add(shelf.id);
                  else updated.delete(shelf.id);
                  return updated;
                });
                startTransition(async () => {
                  try {
                    if (shouldAdd) {
                      await addToShelfAction(shelf.id, arxivId);
                      toast.success(`Added to ${shelf.name}`);
                    } else {
                      await removeFromShelfAction(shelf.id, arxivId);
                      toast.success(`Removed from ${shelf.name}`);
                    }
                    router.refresh();
                  } catch {
                    setMembership((current) => {
                      const updated = new Set(current);
                      if (shouldAdd) updated.delete(shelf.id);
                      else updated.add(shelf.id);
                      return updated;
                    });
                    toast.error(
                      shouldAdd
                        ? "Could not add to that collection"
                        : "Could not remove from that collection",
                    );
                  }
                });
              }}
            >
              {shelf.name}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
