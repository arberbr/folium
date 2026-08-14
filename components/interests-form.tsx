"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ControlButton } from "@/components/control-button";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORY_GROUPS } from "@/lib/arxiv/categories";
import { saveInterestsAction } from "@/lib/actions";

export function InterestsForm({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          try {
            await saveInterestsAction(selected);
            toast("Interests updated — Tomorrow’s drop will follow.");
          } catch {
            toast.error("Could not save interests");
          }
        });
      }}
    >
      {CATEGORY_GROUPS.map((group) => (
        <section key={group.id} className="space-y-3">
          <h2 className="font-heading text-2xl">{group.label}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.categories.map((category) => {
              const checked = selected.includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-card/40 px-4 py-3"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => {
                      setSelected((current) =>
                        value
                          ? [...current, category.id]
                          : current.filter((id) => id !== category.id),
                      );
                    }}
                  />
                  <span>
                    <span className="block text-sm">{category.label}</span>
                    <span className="font-mono text-[11px] text-primary">{category.id}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
      <ControlButton type="submit" disabled={pending || selected.length === 0}>
        Save the map
      </ControlButton>
    </form>
  );
}
