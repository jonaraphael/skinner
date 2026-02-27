import { Difficulty } from "../../app/types";
import { RandomSource } from "./rng";

export type TierWeights = Record<Difficulty, number>;

const clamp = (value: number): number => Math.max(0, value);

const normalize = (weights: TierWeights): TierWeights => {
  const total = weights.easy + weights.medium + weights.hard;
  if (total <= 0) {
    return { easy: 1, medium: 0, hard: 0 };
  }
  return {
    easy: weights.easy / total,
    medium: weights.medium / total,
    hard: weights.hard / total
  };
};

export const getTierWeights = (taskDifficulty: Difficulty, streak: number): TierWeights => {
  let weights: TierWeights;
  if (taskDifficulty === "easy") {
    weights = { easy: 0.8, medium: 0.2, hard: 0 };
  } else if (taskDifficulty === "medium") {
    weights = { easy: 0.2, medium: 0.6, hard: 0.2 };
  } else {
    weights = { easy: 0.1, medium: 0.35, hard: 0.55 };
  }

  if (streak >= 5 && taskDifficulty !== "easy") {
    const shift = Math.min(0.1, weights.easy);
    weights.easy = clamp(weights.easy - shift);
    weights.medium = clamp(weights.medium + shift * 0.5);
    weights.hard = clamp(weights.hard + shift * 0.5);
  }

  if (streak >= 10 && taskDifficulty === "hard") {
    const shift = Math.min(0.1, weights.medium);
    weights.medium = clamp(weights.medium - shift);
    weights.hard = clamp(weights.hard + shift);
  }

  return normalize(weights);
};

export const chooseTier = (taskDifficulty: Difficulty, streak: number, rng: RandomSource): Difficulty => {
  const weights = getTierWeights(taskDifficulty, streak);
  const roll = rng.float01();
  if (roll < weights.easy) {
    return "easy";
  }
  if (roll < weights.easy + weights.medium) {
    return "medium";
  }
  return "hard";
};
