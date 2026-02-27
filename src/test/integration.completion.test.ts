import { beforeEach, describe, expect, test } from "vitest";
import { useSkinnerStore } from "../app/store";

beforeEach(() => {
  localStorage.clear();
  useSkinnerStore.setState((state) => ({
    ...state,
    tasks: [],
    occurrences: [],
    rewardEvents: [],
    activeRewardEvent: null,
    hydrated: true
  }));
});

describe("integration completion", () => {
  test("completing recurring occurrence updates task and records reward event", () => {
    const store = useSkinnerStore.getState();

    const task = store.addTask({
      title: "Daily run",
      notes: null,
      kind: "recurring",
      difficulty: "easy",
      active: true,
      recurrence: {
        kind: "daily",
        interval: 1,
        anchorIso: "2026-02-10T00:00:00.000Z",
        timezone: "America/New_York"
      },
      dueAtIso: null
    });

    useSkinnerStore.getState().rebuildOccurrences("2026-02-11T09:00:00.000Z");
    const occurrence = useSkinnerStore.getState().occurrences.find((item) => item.taskId === task.id);
    expect(occurrence).toBeTruthy();
    if (!occurrence) {
      return;
    }

    useSkinnerStore.getState().markOccurrenceComplete(task.id, occurrence.occurrenceId, "2026-02-11T10:00:00.000Z");

    const nextTask = useSkinnerStore.getState().tasks.find((item) => item.id === task.id);
    expect(nextTask?.completionCount).toBe(1);
    expect(useSkinnerStore.getState().rewardEvents.length).toBe(1);
  });

  test("completing deadline task records reward event", () => {
    const store = useSkinnerStore.getState();

    const task = store.addTask({
      title: "Submit grades",
      notes: null,
      kind: "deadline",
      difficulty: "hard",
      active: true,
      recurrence: null,
      dueAtIso: "2026-02-11T15:00:00.000Z"
    });

    useSkinnerStore.getState().rebuildOccurrences("2026-02-11T10:00:00.000Z");
    const occurrence = useSkinnerStore.getState().occurrences.find((item) => item.taskId === task.id);
    expect(occurrence).toBeTruthy();
    if (!occurrence) {
      return;
    }

    useSkinnerStore.getState().markOccurrenceComplete(task.id, occurrence.occurrenceId, "2026-02-11T11:00:00.000Z");
    expect(useSkinnerStore.getState().rewardEvents).toHaveLength(1);
  });
});
