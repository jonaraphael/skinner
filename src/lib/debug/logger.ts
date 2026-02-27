import { readLocal, STORAGE_KEYS, writeLocal } from "../persistence/storage";

export interface DebugEntry {
  level: "info" | "warn" | "error";
  message: string;
  ts: string;
  context?: Record<string, unknown>;
}

const MAX_LOG_ENTRIES = 300;

const readEntries = (): DebugEntry[] => readLocal<DebugEntry[]>(STORAGE_KEYS.debugLog, []);

const writeEntries = (entries: DebugEntry[]): void => {
  writeLocal(STORAGE_KEYS.debugLog, entries.slice(-MAX_LOG_ENTRIES));
};

export const pushDebugLog = (
  level: DebugEntry["level"],
  message: string,
  context?: Record<string, unknown>
): void => {
  const next = [...readEntries(), { level, message, ts: new Date().toISOString(), context }];
  writeEntries(next);
};

export const readDebugLog = (): DebugEntry[] => readEntries();

export const installDebugWindowHook = (): void => {
  const globalAny = window as Window & {
    __SB_DEBUG__?: {
      read: () => DebugEntry[];
      clear: () => void;
    };
  };

  globalAny.__SB_DEBUG__ = {
    read: readDebugLog,
    clear: () => writeEntries([])
  };
};
