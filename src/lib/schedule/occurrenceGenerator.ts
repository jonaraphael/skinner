import { Task, TaskOccurrence } from "../../app/types";
import { expandRecurrence, RecurrenceWindow } from "./recurrence";
import { isOccurrenceOverdue } from "./dueState";

export interface BuildOccurrencesParams {
  tasks: Task[];
  existing: TaskOccurrence[];
  nowIso: string;
  lookbackDays: number;
  horizonDays: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const toOccurrenceId = (taskId: string, atIso: string, type: "recurring" | "deadline"): string => {
  return type === "recurring" ? `${taskId}:${atIso}` : `${taskId}:deadline:${atIso}`;
};

export const buildOccurrences = ({
  tasks,
  existing,
  nowIso,
  lookbackDays,
  horizonDays
}: BuildOccurrencesParams): TaskOccurrence[] => {
  const now = new Date(nowIso);
  const start = new Date(now.getTime() - lookbackDays * DAY_MS).toISOString();
  const end = new Date(now.getTime() + horizonDays * DAY_MS).toISOString();
  const window: RecurrenceWindow = { startIso: start, endIso: end };
  const existingMap = new Map(existing.map((occ) => [occ.occurrenceId, occ]));
  const next: TaskOccurrence[] = [];

  for (const task of tasks) {
    if (!task.active || task.archivedAtIso) {
      continue;
    }

    if (task.kind === "deadline" && task.dueAtIso) {
      const id = toOccurrenceId(task.id, task.dueAtIso, "deadline");
      const previous = existingMap.get(id);
      next.push({
        occurrenceId: id,
        taskId: task.id,
        scheduledAtIso: task.dueAtIso,
        dueAtIso: task.dueAtIso,
        completedAtIso: previous?.completedAtIso ?? null,
        isOverdue: isOccurrenceOverdue(task.dueAtIso, previous?.completedAtIso ?? null, nowIso)
      });
      continue;
    }

    if (task.kind === "recurring" && task.recurrence) {
      const times = expandRecurrence(task.recurrence, window);
      for (const atIso of times) {
        const id = toOccurrenceId(task.id, atIso, "recurring");
        const previous = existingMap.get(id);
        next.push({
          occurrenceId: id,
          taskId: task.id,
          scheduledAtIso: atIso,
          dueAtIso: atIso,
          completedAtIso: previous?.completedAtIso ?? null,
          isOverdue: isOccurrenceOverdue(atIso, previous?.completedAtIso ?? null, nowIso)
        });
      }
    }
  }

  return next.sort((a, b) => a.scheduledAtIso.localeCompare(b.scheduledAtIso));
};
