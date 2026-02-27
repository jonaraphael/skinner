import { migratePersistedRoot, PersistedRoot, STORAGE_VERSION } from "./migration";

export const STORAGE_KEYS = {
  tasks: "sb:tasks",
  occurrences: "sb:occurrences",
  rewardEvents: "sb:rewardEvents",
  prefs: "sb:prefs",
  session: "sb:session",
  debugLog: "sb:debugLog",
  root: "sb:root"
} as const;

const backupCorruptValue = (key: string, value: string): void => {
  const backupKey = `sb:corrupt:${key}:${Date.now()}`;
  try {
    localStorage.setItem(backupKey, value);
  } catch {
    // Best-effort backup.
  }
};

export const readLocal = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    const raw = localStorage.getItem(key);
    if (raw) {
      backupCorruptValue(key, raw);
    }
    return fallback;
  }
};

export const writeLocal = (key: string, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const readPersistedRoot = (): PersistedRoot => {
  const value = readLocal<unknown>(STORAGE_KEYS.root, null);
  const migrated = migratePersistedRoot(value);
  if (migrated.version !== STORAGE_VERSION) {
    const reset = {
      ...migrated,
      version: STORAGE_VERSION
    };
    writeLocal(STORAGE_KEYS.root, reset);
    return reset;
  }
  return migrated;
};

export const writePersistedRoot = (root: PersistedRoot): void => {
  writeLocal(STORAGE_KEYS.root, root);
  writeLocal(STORAGE_KEYS.tasks, root.tasks);
  writeLocal(STORAGE_KEYS.occurrences, root.occurrences);
  writeLocal(STORAGE_KEYS.rewardEvents, root.rewardEvents);
  writeLocal(STORAGE_KEYS.prefs, root.prefs);
};
