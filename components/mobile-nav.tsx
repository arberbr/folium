"use client";

import { Show } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ControlButton } from "@/components/control-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isActive, NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ITEM = "px-2.5 py-2.5 text-sm";

/**
 * The trigger sits left of the theme and avatar buttons, so `align="end"` alone would hang the
 * menu off the left edge and Radix shifts it back. That shift stops at the collision padding,
 * which therefore has to be the shell gutter exactly, or the menu lands off the page grid.
 * Radix wants a number, so read the CSS gutter rather than restating the breakpoint here.
 */
function useShellGutter() {
  const [gutter, setGutter] = useState(20);

  useEffect(() => {
    const read = () => {
      const value = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--shell-gutter"),
      );
      if (!Number.isNaN(value)) setGutter(value);
    };

    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return gutter;
}

export function MobileNav() {
  const pathname = usePathname();
  const gutter = useShellGutter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ControlButton
          variant="outline"
          size="icon"
          aria-label="Menu"
          className="group/menu md:hidden"
        >
          <Menu className="group-data-[state=open]/menu:hidden" />
          <X className="hidden group-data-[state=open]/menu:block" />
        </ControlButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={9}
        collisionPadding={gutter}
        className="w-[calc(100vw_-_var(--shell-gutter)_*_2)] rounded-xl p-1.5"
      >
        {NAV.map((item) => {
          const link = (
            <DropdownMenuItem
              asChild
              className={cn(ITEM, isActive(pathname, item.href) && "bg-secondary text-foreground")}
            >
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
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
        <Show when="signed-in">
          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className={cn(ITEM, isActive(pathname, "/settings") && "bg-secondary text-foreground")}
          >
            <Link href="/settings">Interests</Link>
          </DropdownMenuItem>
        </Show>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
