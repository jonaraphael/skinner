import { describe, expect, test } from "vitest";
import { Task } from "../app/types";
import { evaluateRewardForCompletion } from "../lib/rewards/rewardEngine";
import { REWARD_POOL } from "../lib/rewards/rewardPools";
import { SeededRng } from "../lib/rewards/rng";

const task: Task = {
  id: "task-1",
  title: "Task",
  notes: null,
  kind: "deadline",
  difficulty: "medium",
  active: true,
  recurrence: null,
  dueAtIso: "2026-02-10T10:00:00.000Z",
  createdAtIso: "2026-02-01T00:00:00.000Z",
  updatedAtIso: "2026-02-01T00:00:00.000Z",
  archivedAtIso: null,
  lastCompletedAtIso: null,
  completionCount: 0
};

describe("reward engine probability", () => {
  test("trigger rate remains in 0.29..0.31 over 10k completions", () => {
    const rng = new SeededRng(123456);
    let triggered = 0;
    const history = [] as ReturnType<typeof evaluateRewardForCompletion>["event"][];

    for (let i = 0; i < 10_000; i += 1) {
      const nowIso = new Date(Date.UTC(2026, 1, 1, 0, 0, i % 60)).toISOString();
      const result = evaluateRewardForCompletion({
        task,
        occurrenceId: `occ-${i}`,
        nowIso,
        streak: 1,
        history,
        pool: REWARD_POOL,
        rng
      });
      history.unshift(result.event);
      if (result.event.triggered) {
        triggered += 1;
      }
    }

    const rate = triggered / 10_000;
    expect(rate).toBeGreaterThanOrEqual(0.29);
    expect(rate).toBeLessThanOrEqual(0.31);
  });
});
