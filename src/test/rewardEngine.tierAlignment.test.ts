import { describe, expect, test } from "vitest";
import { RewardEvent, Task } from "../app/types";
import { evaluateRewardForCompletion } from "../lib/rewards/rewardEngine";
import { REWARD_POOL } from "../lib/rewards/rewardPools";
import { SeededRng } from "../lib/rewards/rng";

const taskEasy: Task = {
  id: "task-easy",
  title: "Easy",
  notes: null,
  kind: "deadline",
  difficulty: "easy",
  active: true,
  recurrence: null,
  dueAtIso: "2026-02-10T10:00:00.000Z",
  createdAtIso: "2026-02-01T00:00:00.000Z",
  updatedAtIso: "2026-02-01T00:00:00.000Z",
  archivedAtIso: null,
  lastCompletedAtIso: null,
  completionCount: 0
};

const taskHard: Task = {
  ...taskEasy,
  id: "task-hard",
  difficulty: "hard"
};

describe("reward engine tier alignment", () => {
  test("easy completion never emits hard-tier reward", () => {
    const rng = new SeededRng(7777);
    const history = [] as ReturnType<typeof evaluateRewardForCompletion>["event"][];

    for (let i = 0; i < 2000; i += 1) {
      const result = evaluateRewardForCompletion({
        task: taskEasy,
        occurrenceId: `occ-e-${i}`,
        nowIso: new Date(Date.UTC(2026, 1, 1, 0, 0, i % 60)).toISOString(),
        streak: 3,
        history,
        pool: REWARD_POOL,
        rng
      });
      history.unshift(result.event);
      if (result.event.triggered) {
        expect(result.event.rewardTier).not.toBe("hard");
      }
    }
  });

  test("cooldown avoids immediate duplicate when alternatives exist", () => {
    const history: RewardEvent[] = [
      {
        id: "e-1",
        taskId: "task-hard",
        occurrenceId: "occ-prev",
        triggered: true,
        roll: 0.1,
        probability: 0.3,
        rewardId: "H01",
        rewardTier: "hard",
        createdAtIso: "2026-02-10T09:00:00.000Z"
      }
    ];

    const result = evaluateRewardForCompletion({
      task: taskHard,
      occurrenceId: "occ-now",
      nowIso: "2026-02-10T10:00:00.000Z",
      streak: 7,
      history,
      pool: REWARD_POOL,
      rng: {
        float01: (() => {
          const sequence = [0.01, 0.95, 0.0];
          let index = 0;
          return () => {
            const value = sequence[Math.min(index, sequence.length - 1)];
            index += 1;
            return value;
          };
        })()
      }
    });

    expect(result.event.triggered).toBe(true);
    expect(result.event.rewardId).not.toBe("H01");
  });
});
