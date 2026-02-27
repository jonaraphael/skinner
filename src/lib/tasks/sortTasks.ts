import { Difficulty, DifficultySort, Task, TaskOccurrence } from "../../app/types";
import { getDueBucket } from "../schedule/dueState";

const DIFFICULTY_ASC: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2
};

const DIFFICULTY_DESC: Record<Difficulty, number> = {
  easy: 2,
  medium: 1,
  hard: 0
};

const TODAY_BUCKET_RANK: Record<string, number> = {
  overdue: 0,
  due_today: 1,
  upcoming: 3,
  later: 4
};

const byDate = (aIso: string | null, bIso: string | null): number => {
  if (!aIso && !bIso) {
    return 0;
  }
  if (!aIso) {
    return 1;
  }
  if (!bIso) {
    return -1;
  }
  return aIso.localeCompare(bIso);
};

const withTask = (occurrences: TaskOccurrence[], tasks: Task[]): Array<{ occurrence: TaskOccurrence; task: Task }> => {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  return occurrences
    .map((occurrence) => {
      const task = taskMap.get(occurrence.taskId);
      return task ? { occurrence, task } : null;
    })
    .filter((item): item is { occurrence: TaskOccurrence; task: Task } => item !== null);
};

export const sortOccurrences = (
  occurrences: TaskOccurrence[],
  tasks: Task[],
  sortMode: DifficultySort,
  nowIso: string
): TaskOccurrence[] => {
  const items = withTask(occurrences, tasks);

  items.sort((a, b) => {
    if (sortMode === "difficulty_asc") {
      const diff = DIFFICULTY_ASC[a.task.difficulty] - DIFFICULTY_ASC[b.task.difficulty];
      if (diff !== 0) {
        return diff;
      }
    }

    if (sortMode === "difficulty_desc") {
      const diff = DIFFICULTY_DESC[a.task.difficulty] - DIFFICULTY_DESC[b.task.difficulty];
      if (diff !== 0) {
        return diff;
      }
    }

    if (sortMode === "due_date") {
      const dueDiff = byDate(a.occurrence.dueAtIso, b.occurrence.dueAtIso);
      if (dueDiff !== 0) {
        return dueDiff;
      }
    }

    const aBucket = getDueBucket(a.occurrence, nowIso);
    const bBucket = getDueBucket(b.occurrence, nowIso);

    const aRank = a.task.kind === "recurring" && aBucket === "due_today" ? 2 : TODAY_BUCKET_RANK[aBucket];
    const bRank = b.task.kind === "recurring" && bBucket === "due_today" ? 2 : TODAY_BUCKET_RANK[bBucket];
    if (aRank !== bRank) {
      return aRank - bRank;
    }

    const diffRank = DIFFICULTY_DESC[a.task.difficulty] - DIFFICULTY_DESC[b.task.difficulty];
    if (diffRank !== 0) {
      return diffRank;
    }

    const dueDiff = byDate(a.occurrence.dueAtIso, b.occurrence.dueAtIso);
    if (dueDiff !== 0) {
      return dueDiff;
    }

    const updatedDiff = b.task.updatedAtIso.localeCompare(a.task.updatedAtIso);
    if (updatedDiff !== 0) {
      return updatedDiff;
    }

    return a.task.title.localeCompare(b.task.title);
  });

  return items.map((item) => item.occurrence);
};

export const filterTasksByDifficulty = (tasks: Task[], difficulty: Difficulty | "all"): Task[] => {
  if (difficulty === "all") {
    return tasks;
  }
  return tasks.filter((task) => task.difficulty === difficulty);
};
