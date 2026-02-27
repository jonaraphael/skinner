import { describe, expect, test } from "vitest";
import { getDueBucket, isOccurrenceOverdue } from "../lib/schedule/dueState";

describe("due state", () => {
  test("marks overdue when due < now and incomplete", () => {
    expect(isOccurrenceOverdue("2026-02-01T00:00:00.000Z", null, "2026-02-02T00:00:00.000Z")).toBe(true);
    expect(isOccurrenceOverdue("2026-02-01T00:00:00.000Z", "2026-02-01T01:00:00.000Z", "2026-02-02T00:00:00.000Z")).toBe(false);
  });

  test("returns due buckets", () => {
    const now = "2026-02-10T12:00:00.000Z";
    expect(
      getDueBucket(
        {
          occurrenceId: "1",
          taskId: "t",
          scheduledAtIso: "2026-02-09T09:00:00.000Z",
          dueAtIso: "2026-02-09T09:00:00.000Z",
          isOverdue: true,
          completedAtIso: null
        },
        now
      )
    ).toBe("overdue");
  });
});
