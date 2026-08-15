import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { ControlButton } from "@/components/control-button";
import { LogoMark } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const SHELL_CONTAINER = "mx-auto w-full max-w-6xl px-(--shell-gutter)";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <SiteHeader />
      <div className={cn(SHELL_CONTAINER, "flex min-h-0 flex-1 flex-col")}>{children}</div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className={cn(SHELL_CONTAINER, "flex h-16 items-center justify-between gap-4")}>
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <LogoMark className="size-[18px]" />
          </span>
          <span className="font-heading text-xl tracking-tight">arXivDesk</span>
        </Link>

        <NavLinks />

        <div className="flex shrink-0 items-center gap-2">
          <MobileNav />
          <ThemeSwitcher />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <ControlButton variant="outline">Sign in</ControlButton>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <ControlButton variant="outline" asChild className="hidden md:inline-flex">
              <Link href="/settings">Interests</Link>
            </ControlButton>
            <UserMenu />
          </Show>
        </div>
      </div>
    </header>
  );
}
