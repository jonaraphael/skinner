export type Difficulty = "easy" | "medium" | "hard";
export type TaskKind = "recurring" | "deadline";

export type RecurrenceKind = "daily" | "weekly" | "monthly" | "interval";

export interface RecurrenceRule {
  kind: RecurrenceKind;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  nthWeekday?: { weekday: number; nth: 1 | 2 | 3 | 4 | -1 };
  intervalUnit?: "hours" | "days" | "weeks";
  anchorIso: string;
  timezone: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  kind: TaskKind;
  difficulty: Difficulty;
  active: boolean;
  recurrence: RecurrenceRule | null;
  dueAtIso: string | null;
  createdAtIso: string;
  updatedAtIso: string;
  archivedAtIso: string | null;
  lastCompletedAtIso: string | null;
  completionCount: number;
}

export interface TaskOccurrence {
  occurrenceId: string;
  taskId: string;
  scheduledAtIso: string;
  dueAtIso: string | null;
  isOverdue: boolean;
  completedAtIso: string | null;
}

export interface RewardDefinition {
  id: string;
  title: string;
  tier: Difficulty;
  contextTags: string[];
  popForTaskDifficulties: Difficulty[];
  minStreak: number;
  cooldownHours: number;
}

export interface RewardEvent {
  id: string;
  taskId: string;
  occurrenceId: string;
  triggered: boolean;
  roll: number;
  probability: number;
  rewardId: string | null;
  rewardTier: Difficulty | null;
  createdAtIso: string;
}

export type DueBucket = "overdue" | "due_today" | "upcoming" | "later";

export type DifficultySort = "default" | "difficulty_asc" | "difficulty_desc" | "due_date";

export interface Preferences {
  timezone: string;
  difficultySort: DifficultySort;
  reduceMotion: boolean;
  lookbackDays: number;
  horizonDays: number;
}

export interface RewardStats {
  completions: number;
  triggered: number;
  triggerRate: number;
  tiers: Record<Difficulty, number>;
}
