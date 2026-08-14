import { SignIn } from "@clerk/nextjs";
import { PageShell } from "@/components/site-header";

export default function SignInPage() {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center py-16">
        <SignIn forceRedirectUrl="/today" signUpUrl="/sign-up" />
      </div>
    </PageShell>
  );
}
