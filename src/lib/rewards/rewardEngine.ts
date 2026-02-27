import { Difficulty, RewardDefinition, RewardEvent, Task } from "../../app/types";
import { RandomSource } from "./rng";
import { chooseTier } from "./rewardPolicy";

export interface EvaluateRewardInput {
  task: Task;
  occurrenceId: string;
  nowIso: string;
  streak: number;
  history: RewardEvent[];
  pool: RewardDefinition[];
  rng: RandomSource;
}

export interface EvaluateRewardResult {
  event: RewardEvent;
  reward: RewardDefinition | null;
}

const PROBABILITY = 0.3;

const hasCooldown = (reward: RewardDefinition, history: RewardEvent[], nowIso: string): boolean => {
  const lastSame = history.find((event) => event.rewardId === reward.id);
  if (!lastSame) {
    return false;
  }

  const elapsedHours = (new Date(nowIso).getTime() - new Date(lastSame.createdAtIso).getTime()) / (1000 * 60 * 60);
  return elapsedHours < reward.cooldownHours;
};

const violatesRepeatWindow = (reward: RewardDefinition, history: RewardEvent[]): boolean => {
  const recent = history
    .filter((event) => event.triggered && event.rewardId)
    .slice(0, 5)
    .map((event) => event.rewardId);
  if (recent.length < 2) {
    return false;
  }
  const repeats = recent.filter((id) => id === reward.id).length;
  return repeats >= 1;
};

const chooseFromCandidates = (
  candidates: RewardDefinition[],
  rng: RandomSource
): RewardDefinition | null => {
  if (candidates.length === 0) {
    return null;
  }
  const idx = Math.floor(rng.float01() * candidates.length);
  return candidates[Math.min(idx, candidates.length - 1)];
};

const filterCandidates = (
  pool: RewardDefinition[],
  tier: Difficulty,
  taskDifficulty: Difficulty,
  streak: number,
  history: RewardEvent[],
  nowIso: string,
  ignoreRepeat: boolean,
  ignoreCooldown: boolean
): RewardDefinition[] => {
  return pool.filter((reward) => {
    if (reward.tier !== tier) {
      return false;
    }
    if (!reward.popForTaskDifficulties.includes(taskDifficulty)) {
      return false;
    }
    if (reward.minStreak > streak) {
      return false;
    }
    if (!ignoreCooldown && hasCooldown(reward, history, nowIso)) {
      return false;
    }
    if (!ignoreRepeat && violatesRepeatWindow(reward, history)) {
      return false;
    }
    return true;
  });
};

const makeEvent = (
  task: Task,
  occurrenceId: string,
  nowIso: string,
  roll: number,
  triggered: boolean,
  rewardId: string | null,
  rewardTier: Difficulty | null
): RewardEvent => {
  return {
    id: `${occurrenceId}:reward:${nowIso}`,
    taskId: task.id,
    occurrenceId,
    triggered,
    roll,
    probability: PROBABILITY,
    rewardId,
    rewardTier,
    createdAtIso: nowIso
  };
};

export const evaluateRewardForCompletion = (input: EvaluateRewardInput): EvaluateRewardResult => {
  const { task, occurrenceId, nowIso, streak, history, pool, rng } = input;
  const roll = rng.float01();
  const triggered = roll < PROBABILITY;

  if (!triggered) {
    return {
      event: makeEvent(task, occurrenceId, nowIso, roll, false, null, null),
      reward: null
    };
  }

  const tier = chooseTier(task.difficulty, streak, rng);

  const attempts: Array<{ ignoreRepeat: boolean; ignoreCooldown: boolean }> = [
    { ignoreRepeat: false, ignoreCooldown: false },
    { ignoreRepeat: true, ignoreCooldown: false },
    { ignoreRepeat: true, ignoreCooldown: true }
  ];

  let chosen: RewardDefinition | null = null;
  for (const attempt of attempts) {
    const candidates = filterCandidates(
      pool,
      tier,
      task.difficulty,
      streak,
      history,
      nowIso,
      attempt.ignoreRepeat,
      attempt.ignoreCooldown
    );
    chosen = chooseFromCandidates(candidates, rng);
    if (chosen) {
      break;
    }
  }

  if (!chosen) {
    chosen = chooseFromCandidates(
      pool.filter((reward) => reward.popForTaskDifficulties.includes(task.difficulty)),
      rng
    );
  }

  return {
    event: makeEvent(task, occurrenceId, nowIso, roll, true, chosen?.id ?? null, chosen?.tier ?? tier),
    reward: chosen
  };
};

export const summarizeRewardEvents = (events: RewardEvent[]) => {
  const completions = events.length;
  const triggered = events.filter((event) => event.triggered).length;
  const tiers = {
    easy: events.filter((event) => event.rewardTier === "easy").length,
    medium: events.filter((event) => event.rewardTier === "medium").length,
    hard: events.filter((event) => event.rewardTier === "hard").length
  };
  return {
    completions,
    triggered,
    triggerRate: completions === 0 ? 0 : triggered / completions,
    tiers
  };
};
