import Link from "next/link";
import { ControlButton } from "@/components/control-button";
import { PageShell } from "@/components/site-header";

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
        <p className="text-xs tracking-[0.28em] text-primary uppercase">404</p>
        <h1 className="font-heading mt-3 text-4xl">This folio is not in the library</h1>
        <p className="mt-3 text-muted-foreground">
          The page may have been moved, or arXiv never assigned that id.
        </p>
        <ControlButton asChild size="lg" className="mt-6">
          <Link href="/today">Return to Today</Link>
        </ControlButton>
      </div>
    </PageShell>
  );
}
