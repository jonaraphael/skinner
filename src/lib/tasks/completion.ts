import { Task } from "../../app/types";

export interface CompletionStats {
  streak: number;
  points: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const toDayNumber = (iso: string): number => {
  return Math.floor(new Date(iso).getTime() / DAY_MS);
};

export const calculateStreak = (task: Task, completionHistoryIso: string[]): number => {
  if (completionHistoryIso.length === 0) {
    return 1;
  }

  const sortedDays = completionHistoryIso
    .map(toDayNumber)
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i += 1) {
    if (sortedDays[i - 1] - sortedDays[i] === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  if (task.lastCompletedAtIso) {
    const gap = toDayNumber(new Date().toISOString()) - toDayNumber(task.lastCompletedAtIso);
    if (gap > 1) {
      return 1;
    }
  }

  return streak;
};

export const applyTaskCompletion = (task: Task, completedAtIso: string): Task => {
  return {
    ...task,
    lastCompletedAtIso: completedAtIso,
    completionCount: task.completionCount + 1,
    updatedAtIso: completedAtIso
  };
};
