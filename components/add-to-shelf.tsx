"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ControlButton } from "@/components/control-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addToShelfAction } from "@/lib/actions";

export function AddToShelf({
  arxivId,
  shelves,
}: {
  arxivId: string;
  shelves: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  if (!shelves.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ControlButton variant="outline" disabled={pending}>
          Add to collection
        </ControlButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {shelves.map((shelf) => (
          <DropdownMenuItem
            key={shelf.id}
            onClick={() => {
              startTransition(async () => {
                try {
                  await addToShelfAction(shelf.id, arxivId);
                  toast(`Added to ${shelf.name}`);
                } catch {
                  toast.error("Could not add to that collection");
                }
              });
            }}
          >
            {shelf.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
