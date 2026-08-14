import { PageShell } from "@/components/site-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell>
      <main className="flex-1 py-8 sm:py-10">{children}</main>
    </PageShell>
  );
}
