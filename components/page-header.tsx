import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="space-y-3">
      <h1 className="font-heading text-4xl sm:text-5xl">{title}</h1>
      {children}
    </header>
  );
}
