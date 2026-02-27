import { describe, expect, test } from "vitest";
import { expandRecurrence } from "../lib/schedule/recurrence";

describe("recurrence monthly", () => {
  test("clamps day-of-month to month end", () => {
    const results = expandRecurrence(
      {
        kind: "monthly",
        interval: 1,
        dayOfMonth: 31,
        anchorIso: "2026-01-31T08:00:00.000Z",
        timezone: "America/New_York"
      },
      {
        startIso: "2026-01-01T00:00:00.000Z",
        endIso: "2026-03-31T23:59:59.000Z"
      }
    );

    expect(results).toEqual([
      "2026-01-31T08:00:00.000Z",
      "2026-02-28T08:00:00.000Z",
      "2026-03-31T08:00:00.000Z"
    ]);
  });
});
