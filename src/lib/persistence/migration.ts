import { Preferences, RewardEvent, Task, TaskOccurrence } from "../../app/types";

export const STORAGE_VERSION = 1;

export interface PersistedRootV1 {
  version: 1;
  tasks: Task[];
  occurrences: TaskOccurrence[];
  rewardEvents: RewardEvent[];
  prefs: Preferences;
}

export type PersistedRoot = PersistedRootV1;

export const createDefaultPrefs = (): Preferences => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  difficultySort: "default",
  reduceMotion: false,
  lookbackDays: 7,
  horizonDays: 30
});

export const createDefaultPersistedRoot = (): PersistedRoot => ({
  version: STORAGE_VERSION,
  tasks: [],
  occurrences: [],
  rewardEvents: [],
  prefs: createDefaultPrefs()
});

const isObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object";
};

export const migratePersistedRoot = (value: unknown): PersistedRoot => {
  if (!isObject(value)) {
    return createDefaultPersistedRoot();
  }

  if (value.version === 1) {
    const current = value as Partial<PersistedRootV1>;
    return {
      version: 1,
      tasks: Array.isArray(current.tasks) ? current.tasks : [],
      occurrences: Array.isArray(current.occurrences) ? current.occurrences : [],
      rewardEvents: Array.isArray(current.rewardEvents) ? current.rewardEvents : [],
      prefs: {
        ...createDefaultPrefs(),
        ...(isObject(current.prefs) ? current.prefs : {})
      }
    };
  }

  return createDefaultPersistedRoot();
};
