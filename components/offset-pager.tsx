import Link from "next/link";
import { ControlButton } from "@/components/control-button";

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
      <ControlButton variant="outline" size="lg" asChild disabled={!hasPrev}>
        <Link href={hasPrev ? hrefFor(prevStart) : hrefFor(0)}>Previous</Link>
      </ControlButton>
      <ControlButton variant="outline" size="lg" asChild disabled={!hasNext}>
        <Link href={hasNext ? hrefFor(nextStart) : hrefFor(start)}>Next</Link>
      </ControlButton>
    </div>
  );
}
