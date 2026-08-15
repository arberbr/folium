import { auth } from "@clerk/nextjs/server";
import { InterestsForm } from "@/components/interests-form";
import { getOrCreateProfile } from "@/lib/data/user";

export default async function SettingsPage() {
  const { userId } = await auth.protect();
  const profile = await getOrCreateProfile(userId);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading max-w-3xl text-4xl leading-tight sm:text-5xl">Interests</h1>
      </header>
      <InterestsForm initial={profile.interests} />
    </div>
  );
}
