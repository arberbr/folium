import { auth } from "@clerk/nextjs/server";
import { InterestsForm } from "@/components/interests-form";
import { PageHeader } from "@/components/page-header";
import { getOrCreateProfile } from "@/lib/data/user";

export default async function SettingsPage() {
  const { userId } = await auth.protect();
  const profile = await getOrCreateProfile(userId);

  return (
    <div className="space-y-8">
      <PageHeader title="Interests" />
      <InterestsForm initial={profile.interests} />
    </div>
  );
}
