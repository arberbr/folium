"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/today", label: "Today", auth: "signed-in" },
  { href: "/explore", label: "Explore", auth: "always" },
  { href: "/library", label: "Library", auth: "signed-in" },
  { href: "/collections", label: "Collections", auth: "signed-in" },
  { href: "/docs", label: "Docs", auth: "always" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/collections") {
    return pathname === "/collections" || pathname.startsWith("/collection/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
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
