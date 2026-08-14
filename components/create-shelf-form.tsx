"use client";

import { useState, useTransition } from "react";
import { ControlButton } from "@/components/control-button";
import { Input } from "@/components/ui/input";

export function CreateShelfForm({
  action,
}: {
  action: (name: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const filled = name.trim().length > 0;

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        startTransition(async () => {
          await action(trimmed);
          setName("");
        });
      }}
    >
      <Input
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New collection name"
        className="w-48"
      />
      <ControlButton type="submit" variant="outline" disabled={pending || !filled}>
        Add collection
      </ControlButton>
    </form>
  );
}
