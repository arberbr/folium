"use client";

import { SignInButton } from "@clerk/nextjs";
import { ControlButton } from "@/components/control-button";

/**
 * Paper pages are readable signed out, so every feature that needs an account
 * degrades to this rather than disappearing without explanation.
 */
export function SignInPrompt({ label = "Sign in" }: { label?: string }) {
  return (
    <SignInButton mode="modal">
      <ControlButton variant="outline">{label}</ControlButton>
    </SignInButton>
  );
}
