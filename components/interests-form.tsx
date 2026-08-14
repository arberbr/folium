"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ControlButton } from "@/components/control-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CATEGORY_GROUPS, type CategoryGroup } from "@/lib/arxiv/categories";
import { saveInterestsAction } from "@/lib/actions";

export function InterestsForm({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const groups = useMemo(() => filterGroups(CATEGORY_GROUPS, query), [query]);

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          try {
            await saveInterestsAction(selected);
            toast.success("Interests updated — Tomorrow’s drop will follow.");
          } catch {
            toast.error("Could not save interests");
          }
        });
      }}
    >
      <div className="space-y-2">
        <Input
          size="lg"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a field — astrophysics, genomics, number theory…"
        />
        <p className="text-sm text-muted-foreground">
          {selected.length} selected · every arXiv subject class is listed
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No fields match that search.</p>
      ) : (
        groups.map((group) => {
          const ids = group.categories.map((category) => category.id);
          const allSelected = ids.every((id) => selected.includes(id));

          return (
            <section key={group.id} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-heading text-2xl">{group.label}</h2>
                <ControlButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSelected((current) =>
                      allSelected
                        ? current.filter((id) => !ids.includes(id))
                        : [...new Set([...current, ...ids])],
                    );
                  }}
                >
                  {allSelected ? "Clear group" : "Select all"}
                </ControlButton>
              </div>
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
          );
        })
      )}

      <div className="sticky bottom-4 z-10 flex justify-start">
        <ControlButton type="submit" size="lg" disabled={pending || selected.length === 0}>
          Save Your Interests
        </ControlButton>
      </div>
    </form>
  );
}

function filterGroups(groups: CategoryGroup[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return groups;

  return groups.flatMap((group) => {
    if (group.label.toLowerCase().includes(needle) || group.id.toLowerCase().includes(needle)) {
      return [group];
    }

    const categories = group.categories.filter(
      (category) =>
        category.label.toLowerCase().includes(needle) ||
        category.id.toLowerCase().includes(needle),
    );
    return categories.length ? [{ ...group, categories }] : [];
  });
}
