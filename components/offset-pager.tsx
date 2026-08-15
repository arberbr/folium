import Link from "next/link";
import type { ReactNode } from "react";
import { ControlButton } from "@/components/control-button";

/**
 * A `<button disabled>` when there is nowhere to go, an anchor when there is.
 * `disabled` on an anchor is inert — CSS `:disabled` never matches one — so at
 * the first and last page the link has to stop being a link.
 */
function PagerButton({
  href,
  enabled,
  children,
}: {
  href: string;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) {
    return (
      <ControlButton variant="outline" size="lg" disabled>
        {children}
      </ControlButton>
    );
  }

  return (
    <ControlButton variant="outline" size="lg" asChild>
      <Link href={href}>{children}</Link>
    </ControlButton>
  );
}

export function OffsetPager({
  hrefFor,
  start,
  pageSize,
  itemCount,
  total,
}: {
  hrefFor: (start: number) => string;
  start: number;
  pageSize: number;
  itemCount: number;
  total?: number;
}) {
  const prevStart = Math.max(0, start - pageSize);
  const nextStart = start + pageSize;
  const hasPrev = start > 0;
  const hasNext =
    total == null ? itemCount >= pageSize : itemCount >= pageSize && nextStart < total;

  return (
    <div className="flex items-center justify-between">
      <PagerButton href={hrefFor(prevStart)} enabled={hasPrev}>
        Previous
      </PagerButton>
      <PagerButton href={hrefFor(nextStart)} enabled={hasNext}>
        Next
      </PagerButton>
    </div>
  );
}
