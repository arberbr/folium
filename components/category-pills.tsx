import Link from "next/link";
import { Chip, ChipGroup } from "@/components/chip";
import { categoryLabel, FEATURED_CATEGORIES } from "@/lib/arxiv/categories";

export function CategoryPills({ active, interests }: { active?: string; interests?: string[] }) {
  const fields = interests?.length ? interests : FEATURED_CATEGORIES.map((category) => category.id);

  return (
    <ChipGroup className="gap-2">
      <Chip asChild variant={!active ? "selected" : "default"} size="md">
        <Link href="/explore" aria-current={!active ? "page" : undefined}>
          All fields
        </Link>
      </Chip>
      {fields.map((id) => {
        const selected = active === id;
        return (
          <Chip key={id} asChild size="md" variant={selected ? "selected" : "default"}>
            <Link
              href={`/explore?cat=${encodeURIComponent(id)}`}
              aria-current={selected ? "page" : undefined}
            >
              {categoryLabel(id)}
            </Link>
          </Chip>
        );
      })}
    </ChipGroup>
  );
}
