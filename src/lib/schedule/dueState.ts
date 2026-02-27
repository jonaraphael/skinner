import { DueBucket, TaskOccurrence } from "../../app/types";

const isSameLocalDay = (a: Date, b: Date): boolean => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

export const isOccurrenceOverdue = (dueAtIso: string | null, completedAtIso: string | null, nowIso: string): boolean => {
  if (!dueAtIso || completedAtIso) {
    return false;
  }
  return new Date(dueAtIso).getTime() < new Date(nowIso).getTime();
};

export const getDueBucket = (occurrence: TaskOccurrence, nowIso: string, upcomingDays = 7): DueBucket => {
  const now = new Date(nowIso);
  const due = occurrence.dueAtIso ? new Date(occurrence.dueAtIso) : new Date(occurrence.scheduledAtIso);

  if (!occurrence.completedAtIso && due.getTime() < now.getTime()) {
    return "overdue";
  }
  if (isSameLocalDay(due, now)) {
    return "due_today";
  }

  const diffDays = (due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  if (diffDays <= upcomingDays) {
    return "upcoming";
  }

  return "later";
};

export const splitByDueBucket = (occurrences: TaskOccurrence[], nowIso: string): Record<DueBucket, TaskOccurrence[]> => {
  return occurrences.reduce<Record<DueBucket, TaskOccurrence[]>>(
    (acc, occurrence) => {
      const bucket = getDueBucket(occurrence, nowIso);
      acc[bucket].push(occurrence);
      return acc;
    },
    {
      overdue: [],
      due_today: [],
      upcoming: [],
      later: []
    }
  );
};
