import Link from "next/link";
import { CATEGORY_GROUPS } from "@/lib/arxiv/categories";
import { Chip, ChipGroup } from "@/components/chip";

export function CategoryPills({
  active,
  interests,
}: {
  active?: string;
  interests?: string[];
}) {
  const featured = CATEGORY_GROUPS[0]?.categories ?? [];
  return (
    <ChipGroup className="gap-2">
      <Chip asChild variant={!active ? "selected" : "default"} size="md">
        <Link href="/explore" aria-current={!active ? "page" : undefined}>
          All fields
        </Link>
      </Chip>
      {featured.map((category) => {
        const selected = active === category.id;
        return (
          <Chip
            key={category.id}
            asChild
            size="md"
            variant={selected ? "selected" : "default"}
            accent={Boolean(interests?.includes(category.id) && !selected)}
          >
            <Link
              href={`/explore?cat=${encodeURIComponent(category.id)}`}
              aria-current={selected ? "page" : undefined}
            >
              {category.label}
            </Link>
          </Chip>
        );
      })}
    </ChipGroup>
  );
}
