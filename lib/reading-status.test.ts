import { describe, expect, it } from "vitest";
import { groupByReadingStatus, READING_STATUS_LABEL } from "./reading-status";

describe("groupByReadingStatus", () => {
  it("omits empty statuses and keeps canonical order", () => {
    const grouped = groupByReadingStatus([
      { id: "2", status: "done" as const },
      { id: "1", status: "queued" as const },
      { id: "3", status: "done" as const },
    ]);

    expect(grouped.map((group) => group.status)).toEqual(["queued", "done"]);
    expect(grouped[0]?.items.map((item) => item.id)).toEqual(["1"]);
    expect(grouped[1]?.items.map((item) => item.id)).toEqual(["2", "3"]);
  });

  it("labels each group from the shared map", () => {
    const [queued] = groupByReadingStatus([{ id: "1", status: "queued" as const }]);
    expect(queued?.label).toBe(READING_STATUS_LABEL.queued);
  });
});
