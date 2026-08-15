"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden min-w-0 items-center gap-1 overflow-x-auto md:flex">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const link = (
          <Link
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );

        if (item.auth === "always") {
          return (
            <span key={item.href} className="contents">
              {link}
            </span>
          );
        }

        return (
          <Show when="signed-in" key={item.href}>
            {link}
          </Show>
        );
      })}
    </nav>
  );
}
