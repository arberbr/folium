import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ControlButton } from "@/components/control-button";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col px-5 sm:px-8">
      <SiteHeader />
      {children}
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-[0.7rem] font-semibold tracking-[0.18em] text-primary-foreground">
            FL
          </span>
          <span className="font-heading text-xl tracking-tight">Folium</span>
        </Link>

        <NavLinks />

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <ControlButton variant="ghost">Sign in</ControlButton>
            </SignInButton>
            <SignUpButton mode="modal">
              <ControlButton>Open the reading room</ControlButton>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <ControlButton variant="ghost" asChild className="md:hidden">
              <Link href="/today">Today</Link>
            </ControlButton>
            <ControlButton variant="outline" asChild>
              <Link href="/settings">Interests</Link>
            </ControlButton>
            <UserButton
              appearance={{
                elements: { avatarBox: "size-8" },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}
