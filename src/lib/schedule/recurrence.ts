import { RecurrenceRule } from "../../app/types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const toUtcStartOfDay = (date: Date): Date => {
  const clone = new Date(date);
  clone.setUTCHours(0, 0, 0, 0);
  return clone;
};

const addDays = (date: Date, days: number): Date => {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + days);
  return clone;
};

const addMonths = (date: Date, months: number): Date => {
  const clone = new Date(date);
  clone.setUTCMonth(clone.getUTCMonth() + months);
  return clone;
};

const daysInMonth = (year: number, monthIndex: number): number => {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
};

const toMonthDay = (date: Date, day: number): Date => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const clamped = Math.min(day, daysInMonth(year, month));
  return new Date(Date.UTC(year, month, clamped, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
};

const nthWeekdayInMonth = (year: number, month: number, weekday: number, nth: number, source: Date): Date => {
  if (nth === -1) {
    const last = new Date(Date.UTC(year, month + 1, 0, source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds()));
    const shift = (last.getUTCDay() - weekday + 7) % 7;
    last.setUTCDate(last.getUTCDate() - shift);
    return last;
  }

  const first = new Date(Date.UTC(year, month, 1, source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds()));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  const target = 1 + offset + (nth - 1) * 7;
  return new Date(Date.UTC(year, month, target, source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds()));
};

const withinWindow = (iso: string, start: Date, end: Date): boolean => {
  const time = new Date(iso).getTime();
  return time >= start.getTime() && time <= end.getTime();
};

export interface RecurrenceWindow {
  startIso: string;
  endIso: string;
}

export const expandRecurrence = (rule: RecurrenceRule, window: RecurrenceWindow): string[] => {
  const start = new Date(window.startIso);
  const end = new Date(window.endIso);
  const anchor = new Date(rule.anchorIso);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || Number.isNaN(anchor.getTime())) {
    return [];
  }

  if (end.getTime() < start.getTime()) {
    return [];
  }

  switch (rule.kind) {
    case "daily": {
      const results: string[] = [];
      const intervalDays = Math.max(1, Math.floor(rule.interval));
      const cursor = toUtcStartOfDay(anchor);
      let step = 0;

      while (step < 3660) {
        const current = addDays(cursor, step * intervalDays);
        if (current.getTime() > end.getTime()) {
          break;
        }
        const currentIso = current.toISOString();
        if (withinWindow(currentIso, start, end)) {
          results.push(currentIso);
        }
        step += 1;
      }

      return results;
    }
    case "weekly": {
      const daysOfWeek = (rule.daysOfWeek ?? [anchor.getUTCDay()])
        .map((day) => Math.max(0, Math.min(6, day)))
        .sort((a, b) => a - b);
      const intervalWeeks = Math.max(1, Math.floor(rule.interval));
      const results: string[] = [];
      let cursor = toUtcStartOfDay(anchor);
      const anchorWeekStart = addDays(cursor, -cursor.getUTCDay());

      while (cursor.getTime() <= end.getTime()) {
        const diffDays = Math.floor((cursor.getTime() - anchorWeekStart.getTime()) / DAY_MS);
        const weekOffset = Math.floor(diffDays / 7);
        if (weekOffset >= 0 && weekOffset % intervalWeeks === 0) {
          for (const day of daysOfWeek) {
            const candidate = addDays(addDays(anchorWeekStart, weekOffset * 7), day);
            const candidateIso = candidate.toISOString();
            if (withinWindow(candidateIso, start, end)) {
              results.push(candidateIso);
            }
          }
        }
        cursor = addDays(cursor, 7);
      }

      return Array.from(new Set(results)).sort();
    }
    case "monthly": {
      const intervalMonths = Math.max(1, Math.floor(rule.interval));
      const results: string[] = [];
      let cursor = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1, anchor.getUTCHours(), anchor.getUTCMinutes(), anchor.getUTCSeconds()));
      let iteration = 0;

      while (iteration < 240) {
        if (cursor.getTime() > end.getTime()) {
          break;
        }

        if (rule.nthWeekday) {
          const nth = nthWeekdayInMonth(
            cursor.getUTCFullYear(),
            cursor.getUTCMonth(),
            rule.nthWeekday.weekday,
            rule.nthWeekday.nth,
            anchor
          );
          const nthIso = nth.toISOString();
          if (withinWindow(nthIso, start, end)) {
            results.push(nthIso);
          }
        } else {
          const day = rule.dayOfMonth ?? anchor.getUTCDate();
          const monthDay = toMonthDay(cursor, day);
          const monthIso = monthDay.toISOString();
          if (withinWindow(monthIso, start, end)) {
            results.push(monthIso);
          }
        }

        cursor = addMonths(cursor, intervalMonths);
        iteration += 1;
      }

      return results.sort();
    }
    case "interval": {
      const unit = rule.intervalUnit ?? "hours";
      const interval = Math.max(1, Math.floor(rule.interval));
      const stepMs = unit === "hours" ? interval * HOUR_MS : unit === "days" ? interval * DAY_MS : interval * DAY_MS * 7;
      const results: string[] = [];

      let cursorTime = anchor.getTime();
      if (cursorTime < start.getTime()) {
        const diff = start.getTime() - cursorTime;
        const skips = Math.floor(diff / stepMs);
        cursorTime += skips * stepMs;
      }

      while (cursorTime <= end.getTime()) {
        const iso = new Date(cursorTime).toISOString();
        if (withinWindow(iso, start, end)) {
          results.push(iso);
        }
        cursorTime += stepMs;
      }

      return results;
    }
    default:
      return [];
  }
};
