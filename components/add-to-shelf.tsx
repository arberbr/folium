"use client";

import { useState } from "react";
import { ControlButton } from "@/components/control-button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerAction } from "@/hooks/use-server-action";
import { addToShelfAction, removeFromShelfAction } from "@/lib/actions";

export function AddToShelf({
  arxivId,
  shelves,
}: {
  arxivId: string;
  shelves: { id: string; name: string; paperIds: string[] }[];
}) {
  const { pending, run } = useServerAction();
  const [membership, setMembership] = useState(
    () =>
      new Set(shelves.filter((shelf) => shelf.paperIds.includes(arxivId)).map((shelf) => shelf.id)),
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
                run({
                  action: () =>
                    shouldAdd
                      ? addToShelfAction(shelf.id, arxivId)
                      : removeFromShelfAction(shelf.id, arxivId),
                  success: shouldAdd ? `Added to ${shelf.name}` : `Removed from ${shelf.name}`,
                  error: shouldAdd
                    ? "Could not add to that collection"
                    : "Could not remove from that collection",
                  onError: () => {
                    setMembership((current) => {
                      const updated = new Set(current);
                      if (shouldAdd) updated.delete(shelf.id);
                      else updated.add(shelf.id);
                      return updated;
                    });
                  },
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
