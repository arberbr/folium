"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { ControlButton } from "@/components/control-button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  defaultQuery = "",
  defaultCategory = "",
}: {
  defaultQuery?: string;
  defaultCategory?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  return (
    <form
      className="flex w-full items-stretch gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (defaultCategory) params.set("cat", defaultCategory);
        router.push(`/explore?${params.toString()}`);
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          size="lg"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, authors, claims, or an arXiv id"
          className="bg-card/80 pl-11"
        />
      </div>
      <ControlButton type="submit" size="lg">
        Search
      </ControlButton>
    </form>
  );
}
