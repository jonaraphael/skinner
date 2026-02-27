import { describe, expect, test } from "vitest";
import { expandRecurrence } from "../lib/schedule/recurrence";

describe("recurrence weekly", () => {
  test("respects week interval and weekdays", () => {
    const results = expandRecurrence(
      {
        kind: "weekly",
        interval: 1,
        daysOfWeek: [1, 3],
        anchorIso: "2026-02-02T08:00:00.000Z",
        timezone: "America/New_York"
      },
      {
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-15T00:00:00.000Z"
      }
    );

    expect(results).toContain("2026-02-02T00:00:00.000Z");
    expect(results).toContain("2026-02-04T00:00:00.000Z");
    expect(results).toContain("2026-02-09T00:00:00.000Z");
    expect(results).toContain("2026-02-11T00:00:00.000Z");
  });
});
