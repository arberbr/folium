import { SignUp } from "@clerk/nextjs";
import { PageShell } from "@/components/site-header";

export default function SignUpPage() {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center py-16">
        <SignUp forceRedirectUrl="/today" signInUrl="/sign-in" />
      </div>
    </PageShell>
  );
}
