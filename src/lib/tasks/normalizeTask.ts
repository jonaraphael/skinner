import { Difficulty, RecurrenceRule, Task, TaskKind } from "../../app/types";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const KINDS: TaskKind[] = ["recurring", "deadline"];

const isString = (value: unknown): value is string => typeof value === "string";

const normalizeRecurrence = (value: unknown, timezoneFallback: string): RecurrenceRule | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const maybe = value as Partial<RecurrenceRule>;
  if (!maybe.kind || !["daily", "weekly", "monthly", "interval"].includes(maybe.kind)) {
    return null;
  }
  const interval = Number(maybe.interval);
  if (!Number.isFinite(interval) || interval < 1) {
    return null;
  }
  const anchorIso = isString(maybe.anchorIso) ? maybe.anchorIso : new Date().toISOString();
  const timezone = isString(maybe.timezone) ? maybe.timezone : timezoneFallback;
  const daysOfWeek = Array.isArray(maybe.daysOfWeek)
    ? maybe.daysOfWeek.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    : undefined;
  const dayOfMonth = Number.isInteger(maybe.dayOfMonth) ? maybe.dayOfMonth : undefined;
  const intervalUnit = maybe.intervalUnit && ["hours", "days", "weeks"].includes(maybe.intervalUnit)
    ? maybe.intervalUnit
    : undefined;
  const nthWeekday =
    maybe.nthWeekday &&
    Number.isInteger(maybe.nthWeekday.weekday) &&
    Number.isInteger(maybe.nthWeekday.nth)
      ? {
          weekday: maybe.nthWeekday.weekday,
          nth: maybe.nthWeekday.nth as 1 | 2 | 3 | 4 | -1
        }
      : undefined;

  return {
    kind: maybe.kind,
    interval,
    anchorIso,
    timezone,
    daysOfWeek,
    dayOfMonth,
    nthWeekday,
    intervalUnit
  };
};

export const normalizeTask = (value: unknown, timezoneFallback: string): Task | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const maybe = value as Partial<Task>;
  if (!isString(maybe.id) || !isString(maybe.title) || maybe.title.trim().length === 0) {
    return null;
  }
  const kind = KINDS.includes(maybe.kind as TaskKind) ? (maybe.kind as TaskKind) : "deadline";
  const difficulty = DIFFICULTIES.includes(maybe.difficulty as Difficulty)
    ? (maybe.difficulty as Difficulty)
    : "medium";

  const nowIso = new Date().toISOString();
  const recurrence = normalizeRecurrence(maybe.recurrence, timezoneFallback);
  const dueAtIso = isString(maybe.dueAtIso) ? maybe.dueAtIso : null;

  return {
    id: maybe.id,
    title: maybe.title.trim(),
    notes: isString(maybe.notes) ? maybe.notes : null,
    kind,
    difficulty,
    active: typeof maybe.active === "boolean" ? maybe.active : true,
    recurrence: kind === "recurring" ? recurrence : null,
    dueAtIso: kind === "deadline" ? dueAtIso : null,
    createdAtIso: isString(maybe.createdAtIso) ? maybe.createdAtIso : nowIso,
    updatedAtIso: isString(maybe.updatedAtIso) ? maybe.updatedAtIso : nowIso,
    archivedAtIso: isString(maybe.archivedAtIso) ? maybe.archivedAtIso : null,
    lastCompletedAtIso: isString(maybe.lastCompletedAtIso) ? maybe.lastCompletedAtIso : null,
    completionCount: Number.isInteger(maybe.completionCount) && (maybe.completionCount as number) >= 0
      ? (maybe.completionCount as number)
      : 0
  };
};

export const normalizeTasks = (value: unknown, timezoneFallback: string): Task[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((task) => normalizeTask(task, timezoneFallback))
    .filter((task): task is Task => task !== null);
};
