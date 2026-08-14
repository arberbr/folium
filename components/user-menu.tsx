"use client";

import { UserButton } from "@clerk/nextjs";
import { Plug } from "lucide-react";
import { OpenRouterPanel } from "@/components/openrouter-panel";

export function UserMenu() {
  return (
    <UserButton appearance={{ elements: { avatarBox: "size-8" } }}>
      <UserButton.UserProfilePage
        label="Integrations"
        url="integrations"
        labelIcon={<Plug className="size-4" />}
      >
        <OpenRouterPanel />
      </UserButton.UserProfilePage>
    </UserButton>
  );
}
