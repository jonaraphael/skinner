import { describe, expect, test } from "vitest";
import { expandRecurrence } from "../lib/schedule/recurrence";

describe("recurrence daily", () => {
  test("generates every N days from anchor", () => {
    const results = expandRecurrence(
      {
        kind: "daily",
        interval: 2,
        anchorIso: "2026-02-01T09:00:00.000Z",
        timezone: "America/New_York"
      },
      {
        startIso: "2026-02-01T00:00:00.000Z",
        endIso: "2026-02-08T23:59:59.000Z"
      }
    );

    expect(results).toEqual([
      "2026-02-01T00:00:00.000Z",
      "2026-02-03T00:00:00.000Z",
      "2026-02-05T00:00:00.000Z",
      "2026-02-07T00:00:00.000Z"
    ]);
  });
});
