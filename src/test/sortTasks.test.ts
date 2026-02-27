import { describe, expect, test } from "vitest";
import { Task, TaskOccurrence } from "../app/types";
import { sortOccurrences } from "../lib/tasks/sortTasks";

const baseTask = (id: string, difficulty: Task["difficulty"]): Task => ({
  id,
  title: id,
  notes: null,
  kind: "deadline",
  difficulty,
  active: true,
  recurrence: null,
  dueAtIso: `2026-02-0${id}T10:00:00.000Z`,
  createdAtIso: "2026-01-01T00:00:00.000Z",
  updatedAtIso: "2026-02-01T00:00:00.000Z",
  archivedAtIso: null,
  lastCompletedAtIso: null,
  completionCount: 0
});

const baseOccurrence = (taskId: string, dueAtIso: string): TaskOccurrence => ({
  occurrenceId: taskId,
  taskId,
  scheduledAtIso: dueAtIso,
  dueAtIso,
  isOverdue: false,
  completedAtIso: null
});

describe("sort tasks", () => {
  test("supports difficulty descending", () => {
    const tasks = [baseTask("1", "easy"), baseTask("2", "hard"), baseTask("3", "medium")];
    const occ = [
      baseOccurrence("1", "2026-02-12T10:00:00.000Z"),
      baseOccurrence("2", "2026-02-12T10:00:00.000Z"),
      baseOccurrence("3", "2026-02-12T10:00:00.000Z")
    ];

    const sorted = sortOccurrences(occ, tasks, "difficulty_desc", "2026-02-10T09:00:00.000Z");
    expect(sorted.map((item) => item.taskId)).toEqual(["2", "3", "1"]);
  });
});
