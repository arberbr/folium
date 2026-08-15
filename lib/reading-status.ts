import { type ReadingStatus, readingStatuses } from "@/lib/db/schema";

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  queued: "Queue",
  reading: "Reading",
  done: "Read",
  skipped: "Skipped",
};

export function groupByReadingStatus<T extends { status: ReadingStatus }>(items: T[]) {
  return readingStatuses
    .map((status) => ({
      status,
      label: READING_STATUS_LABEL[status],
      items: items.filter((item) => item.status === status),
    }))
    .filter((group) => group.items.length > 0);
}
