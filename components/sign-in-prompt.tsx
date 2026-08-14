"use client";

import type { ComponentProps } from "react";
import { SignInButton } from "@clerk/nextjs";
import { ControlButton } from "@/components/control-button";

type ControlButtonProps = ComponentProps<typeof ControlButton>;

/**
 * Paper pages are readable signed out, so every feature that needs an account
 * degrades to this rather than disappearing without explanation.
 */
export function SignInPrompt({
  label = "Sign in",
  variant = "outline",
  size,
}: {
  label?: string;
  variant?: ControlButtonProps["variant"];
  size?: ControlButtonProps["size"];
}) {
  return (
    <SignInButton mode="modal">
      <ControlButton variant={variant} size={size}>
        {label}
      </ControlButton>
    </SignInButton>
  );
}
