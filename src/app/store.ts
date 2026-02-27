import { create } from "zustand";
import {
  Difficulty,
  DifficultySort,
  Preferences,
  RewardDefinition,
  RewardEvent,
  Task,
  TaskOccurrence
} from "./types";
import { pushDebugLog } from "../lib/debug/logger";
import { createDefaultPrefs, createDefaultPersistedRoot, PersistedRoot } from "../lib/persistence/migration";
import { readPersistedRoot, writePersistedRoot } from "../lib/persistence/storage";
import { buildOccurrences } from "../lib/schedule/occurrenceGenerator";
import { evaluateRewardForCompletion, summarizeRewardEvents } from "../lib/rewards/rewardEngine";
import { REWARD_POOL } from "../lib/rewards/rewardPools";
import { createCryptoRng } from "../lib/rewards/rng";
import { applyTaskCompletion } from "../lib/tasks/completion";
import { normalizeTask, normalizeTasks } from "../lib/tasks/normalizeTask";
import { sortOccurrences } from "../lib/tasks/sortTasks";

const randomId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

const currentTimezone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

interface TasksSlice {
  tasks: Task[];
  addTask: (input: Omit<Task, "id" | "createdAtIso" | "updatedAtIso" | "archivedAtIso" | "completionCount" | "lastCompletedAtIso">) => Task;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  archiveTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
}

interface OccurrenceSlice {
  occurrences: TaskOccurrence[];
  rebuildOccurrences: (nowIso?: string) => void;
  markOccurrenceComplete: (taskId: string, occurrenceId: string, nowIso?: string) => void;
}

interface RewardSlice {
  rewardEvents: RewardEvent[];
  rewardPool: RewardDefinition[];
  activeRewardEvent: RewardEvent | null;
  dismissRewardModal: () => void;
}

interface PrefsSlice {
  prefs: Preferences;
  setDifficultySort: (sort: DifficultySort) => void;
  setReduceMotion: (enabled: boolean) => void;
  setTimezone: (timezone: string) => void;
}

interface UiSlice {
  difficultyFilter: Difficulty | "all";
  setDifficultyFilter: (difficulty: Difficulty | "all") => void;
}

interface SessionSlice {
  hydrated: boolean;
  initializeFromStorage: () => void;
  exportBackup: () => string;
  importBackup: (jsonText: string) => boolean;
}

export type SkinnerState = TasksSlice & OccurrenceSlice & RewardSlice & PrefsSlice & UiSlice & SessionSlice;

const persistState = (state: SkinnerState): void => {
  const root: PersistedRoot = {
    version: 1,
    tasks: state.tasks,
    occurrences: state.occurrences,
    rewardEvents: state.rewardEvents,
    prefs: state.prefs
  };
  writePersistedRoot(root);
};

const getTaskStreak = (taskId: string, events: RewardEvent[], nowIso: string): number => {
  const days = events
    .filter((event) => event.taskId === taskId)
    .map((event) => {
      const d = new Date(event.createdAtIso);
      return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    });

  const now = new Date(nowIso);
  const dayKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  const unique = Array.from(new Set([...days, dayKey]));
  if (unique.length === 0) {
    return 1;
  }

  const sorted = unique
    .map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return Date.UTC(y, m, d);
    })
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const diffDays = Math.round((sorted[i - 1] - sorted[i]) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

const defaultRoot = createDefaultPersistedRoot();

export const useSkinnerStore = create<SkinnerState>((set, get) => ({
  tasks: defaultRoot.tasks,
  occurrences: defaultRoot.occurrences,
  rewardEvents: defaultRoot.rewardEvents,
  rewardPool: REWARD_POOL,
  activeRewardEvent: null,
  prefs: createDefaultPrefs(),
  difficultyFilter: "all",
  hydrated: false,

  initializeFromStorage: () => {
    const restored = readPersistedRoot();
    const normalizedTasks = normalizeTasks(restored.tasks, restored.prefs.timezone || currentTimezone());
    const nextPrefs = {
      ...createDefaultPrefs(),
      ...restored.prefs
    };

    set((state) => ({
      ...state,
      tasks: normalizedTasks,
      occurrences: Array.isArray(restored.occurrences) ? restored.occurrences : [],
      rewardEvents: Array.isArray(restored.rewardEvents) ? restored.rewardEvents : [],
      prefs: nextPrefs,
      hydrated: true
    }));

    get().rebuildOccurrences();
    pushDebugLog("info", "hydrate.complete", {
      tasks: normalizedTasks.length,
      occurrences: restored.occurrences.length,
      rewardEvents: restored.rewardEvents.length
    });
  },

  addTask: (input) => {
    const nowIso = new Date().toISOString();
    const task: Task = {
      ...input,
      id: randomId(),
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      archivedAtIso: null,
      completionCount: 0,
      lastCompletedAtIso: null
    };

    set((state) => {
      const next = { ...state, tasks: [task, ...state.tasks] };
      persistState(next);
      return next;
    });

    get().rebuildOccurrences();
    pushDebugLog("info", "task.add", { taskId: task.id });
    return task;
  },

  updateTask: (taskId, patch) => {
    const nowIso = new Date().toISOString();
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const merged = normalizeTask(
          {
            ...task,
            ...patch,
            id: task.id,
            updatedAtIso: nowIso
          },
          state.prefs.timezone
        );
        return merged ?? { ...task, ...patch, updatedAtIso: nowIso };
      });
      const next = { ...state, tasks };
      persistState(next);
      return next;
    });
    get().rebuildOccurrences();
    pushDebugLog("info", "task.update", { taskId });
  },

  archiveTask: (taskId) => {
    const nowIso = new Date().toISOString();
    set((state) => {
      const tasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, active: false, archivedAtIso: nowIso, updatedAtIso: nowIso } : task
      );
      const next = { ...state, tasks };
      persistState(next);
      return next;
    });
    get().rebuildOccurrences();
    pushDebugLog("info", "task.archive", { taskId });
  },

  deleteTask: (taskId) => {
    set((state) => {
      const tasks = state.tasks.filter((task) => task.id !== taskId);
      const occurrences = state.occurrences.filter((occ) => occ.taskId !== taskId);
      const rewardEvents = state.rewardEvents.filter((event) => event.taskId !== taskId);
      const next = { ...state, tasks, occurrences, rewardEvents };
      persistState(next);
      return next;
    });
    pushDebugLog("warn", "task.delete", { taskId });
  },

  rebuildOccurrences: (nowIso) => {
    const when = nowIso ?? new Date().toISOString();
    set((state) => {
      const occurrences = buildOccurrences({
        tasks: state.tasks,
        existing: state.occurrences,
        nowIso: when,
        lookbackDays: state.prefs.lookbackDays,
        horizonDays: state.prefs.horizonDays
      });
      const next = { ...state, occurrences };
      persistState(next);
      return next;
    });
  },

  markOccurrenceComplete: (taskId, occurrenceId, nowIso) => {
    const when = nowIso ?? new Date().toISOString();
    const state = get();
    const task = state.tasks.find((candidate) => candidate.id === taskId);
    if (!task) {
      return;
    }

    set((current) => {
      const occurrences = current.occurrences.map((occurrence) => {
        if (occurrence.occurrenceId !== occurrenceId) {
          return occurrence;
        }
        return {
          ...occurrence,
          completedAtIso: occurrence.completedAtIso ?? when,
          isOverdue: false
        };
      });

      const tasks = current.tasks.map((candidate) =>
        candidate.id === taskId ? applyTaskCompletion(candidate, when) : candidate
      );

      const streak = getTaskStreak(taskId, current.rewardEvents, when);
      const historyDesc = [...current.rewardEvents].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
      const taskForReward = tasks.find((candidate) => candidate.id === taskId) ?? task;
      const evaluation = evaluateRewardForCompletion({
        task: taskForReward,
        occurrenceId,
        nowIso: when,
        streak,
        history: historyDesc,
        pool: current.rewardPool,
        rng: createCryptoRng()
      });

      const rewardEvents = [evaluation.event, ...current.rewardEvents];
      const next = {
        ...current,
        tasks,
        occurrences,
        rewardEvents,
        activeRewardEvent: evaluation.event.triggered ? evaluation.event : null
      };
      persistState(next);
      pushDebugLog("info", "completion.reward", {
        taskId,
        occurrenceId,
        roll: evaluation.event.roll,
        triggered: evaluation.event.triggered,
        rewardId: evaluation.event.rewardId
      });
      return next;
    });
  },

  dismissRewardModal: () => {
    set((state) => ({ ...state, activeRewardEvent: null }));
  },

  setDifficultySort: (sort) => {
    set((state) => {
      const next = {
        ...state,
        prefs: {
          ...state.prefs,
          difficultySort: sort
        }
      };
      persistState(next);
      return next;
    });
  },

  setReduceMotion: (enabled) => {
    set((state) => {
      const next = {
        ...state,
        prefs: {
          ...state.prefs,
          reduceMotion: enabled
        }
      };
      persistState(next);
      return next;
    });
  },

  setTimezone: (timezone) => {
    set((state) => {
      const next = {
        ...state,
        prefs: {
          ...state.prefs,
          timezone
        }
      };
      persistState(next);
      return next;
    });
    get().rebuildOccurrences();
  },

  setDifficultyFilter: (difficulty) => {
    set((state) => ({ ...state, difficultyFilter: difficulty }));
  },

  exportBackup: () => {
    const state = get();
    const root: PersistedRoot = {
      version: 1,
      tasks: state.tasks,
      occurrences: state.occurrences,
      rewardEvents: state.rewardEvents,
      prefs: state.prefs
    };
    return JSON.stringify(root, null, 2);
  },

  importBackup: (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText) as PersistedRoot;
      const migrated = {
        ...createDefaultPersistedRoot(),
        ...parsed,
        prefs: {
          ...createDefaultPrefs(),
          ...parsed.prefs
        }
      };

      set((state) => ({
        ...state,
        tasks: normalizeTasks(migrated.tasks, migrated.prefs.timezone),
        occurrences: Array.isArray(migrated.occurrences) ? migrated.occurrences : [],
        rewardEvents: Array.isArray(migrated.rewardEvents) ? migrated.rewardEvents : [],
        prefs: migrated.prefs
      }));

      persistState(get());
      get().rebuildOccurrences();
      return true;
    } catch {
      return false;
    }
  }
}));

export const selectSortedOccurrences = (state: SkinnerState, nowIso: string): TaskOccurrence[] => {
  return sortOccurrences(state.occurrences, state.tasks, state.prefs.difficultySort, nowIso);
};

export const selectRewardStats = (state: SkinnerState) => summarizeRewardEvents(state.rewardEvents);
