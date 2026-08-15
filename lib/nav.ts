export type NavItem = {
  href: string;
  label: string;
  auth: "always" | "signed-in";
};

export const NAV: readonly NavItem[] = [
  { href: "/today", label: "Today", auth: "signed-in" },
  { href: "/explore", label: "Explore", auth: "always" },
  { href: "/library", label: "Library", auth: "signed-in" },
  { href: "/collections", label: "Collections", auth: "signed-in" },
  { href: "/docs", label: "Docs", auth: "always" },
];

export function isActive(pathname: string, href: string) {
  if (href === "/collections") {
    return pathname === "/collections" || pathname.startsWith("/collection/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
