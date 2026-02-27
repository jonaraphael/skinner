import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RecurrenceKind, Task } from "../app/types";
import { TopBar } from "../components/TopBar";
import { useSkinnerStore } from "../app/store";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toLocalInputValue = (iso: string | null): string => {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

export const TaskEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tasks = useSkinnerStore((state) => state.tasks);
  const addTask = useSkinnerStore((state) => state.addTask);
  const updateTask = useSkinnerStore((state) => state.updateTask);
  const prefs = useSkinnerStore((state) => state.prefs);

  const existing = useMemo(() => tasks.find((task) => task.id === id) ?? null, [tasks, id]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [kind, setKind] = useState<Task["kind"]>(existing?.kind ?? "recurring");
  const [difficulty, setDifficulty] = useState<Task["difficulty"]>(existing?.difficulty ?? "medium");
  const [dueAt, setDueAt] = useState(toLocalInputValue(existing?.dueAtIso ?? new Date().toISOString()));
  const [recurrenceKind, setRecurrenceKind] = useState<RecurrenceKind>(existing?.recurrence?.kind ?? "daily");
  const [interval, setInterval] = useState(existing?.recurrence?.interval ?? 1);
  const [intervalUnit, setIntervalUnit] = useState(existing?.recurrence?.intervalUnit ?? "hours");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(existing?.recurrence?.daysOfWeek ?? [new Date().getDay()]);
  const [dayOfMonth, setDayOfMonth] = useState(existing?.recurrence?.dayOfMonth ?? new Date().getDate());
  const [nthWeekday, setNthWeekday] = useState(existing?.recurrence?.nthWeekday?.nth ?? 1);
  const [nthWeekdayDay, setNthWeekdayDay] = useState(existing?.recurrence?.nthWeekday?.weekday ?? 1);
  const [monthlyMode, setMonthlyMode] = useState<"dayOfMonth" | "nthWeekday">(
    existing?.recurrence?.nthWeekday ? "nthWeekday" : "dayOfMonth"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) {
      return;
    }
    setTitle(existing.title);
    setNotes(existing.notes ?? "");
    setKind(existing.kind);
    setDifficulty(existing.difficulty);
    setDueAt(toLocalInputValue(existing.dueAtIso));
    setRecurrenceKind(existing.recurrence?.kind ?? "daily");
    setInterval(existing.recurrence?.interval ?? 1);
    setIntervalUnit(existing.recurrence?.intervalUnit ?? "hours");
    setDaysOfWeek(existing.recurrence?.daysOfWeek ?? [new Date().getDay()]);
    setDayOfMonth(existing.recurrence?.dayOfMonth ?? new Date().getDate());
    setNthWeekday(existing.recurrence?.nthWeekday?.nth ?? 1);
    setNthWeekdayDay(existing.recurrence?.nthWeekday?.weekday ?? 1);
    setMonthlyMode(existing.recurrence?.nthWeekday ? "nthWeekday" : "dayOfMonth");
  }, [existing]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((current) => {
      if (current.includes(day)) {
        return current.filter((entry) => entry !== day);
      }
      return [...current, day].sort((a, b) => a - b);
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (interval < 1) {
      setError("Interval must be at least 1.");
      return;
    }
    if (kind === "deadline" && !dueAt) {
      setError("Deadline tasks require a due date.");
      return;
    }

    const recurrence =
      kind === "recurring"
        ? {
            kind: recurrenceKind,
            interval,
            intervalUnit,
            daysOfWeek: recurrenceKind === "weekly" ? daysOfWeek : undefined,
            dayOfMonth: recurrenceKind === "monthly" && monthlyMode === "dayOfMonth" ? dayOfMonth : undefined,
            nthWeekday:
              recurrenceKind === "monthly" && monthlyMode === "nthWeekday"
                ? {
                    nth: nthWeekday as 1 | 2 | 3 | 4 | -1,
                    weekday: nthWeekdayDay
                  }
                : undefined,
            anchorIso: existing?.recurrence?.anchorIso ?? new Date().toISOString(),
            timezone: prefs.timezone
          }
        : null;

    const payload = {
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : null,
      kind,
      difficulty,
      active: true,
      recurrence,
      dueAtIso: kind === "deadline" ? new Date(dueAt).toISOString() : null
    };

    if (existing) {
      updateTask(existing.id, payload);
    } else {
      addTask(payload);
    }

    navigate("/");
  };

  return (
    <section className="screen">
      <TopBar title={existing ? "Edit Task" : "New Task"} />

      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write lecture slides"
            required
          />
        </label>

        <label className="field">
          <span>Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional context"
            rows={3}
          />
        </label>

        <label className="field">
          <span>Type</span>
          <select value={kind} onChange={(event) => setKind(event.target.value as Task["kind"])}>
            <option value="recurring">Recurring</option>
            <option value="deadline">Deadline</option>
          </select>
        </label>

        <label className="field">
          <span>Difficulty</span>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Task["difficulty"])}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        {kind === "deadline" ? (
          <label className="field">
            <span>Due At</span>
            <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
          </label>
        ) : (
          <>
            <label className="field">
              <span>Recurrence</span>
              <select value={recurrenceKind} onChange={(event) => setRecurrenceKind(event.target.value as RecurrenceKind)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="interval">Interval</option>
              </select>
            </label>

            <label className="field">
              <span>Interval</span>
              <input
                type="number"
                min={1}
                value={interval}
                onChange={(event) => setInterval(Number(event.target.value) || 1)}
              />
            </label>

            {recurrenceKind === "interval" ? (
              <label className="field">
                <span>Interval Unit</span>
                <select value={intervalUnit} onChange={(event) => setIntervalUnit(event.target.value as "hours" | "days" | "weeks")}>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </label>
            ) : null}

            {recurrenceKind === "weekly" ? (
              <fieldset className="weekday-fieldset">
                <legend>Weekdays</legend>
                <div className="weekday-grid">
                  {weekdayLabels.map((label, day) => (
                    <button
                      key={label}
                      type="button"
                      className={daysOfWeek.includes(day) ? "chip active" : "chip"}
                      onClick={() => toggleDay(day)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {recurrenceKind === "monthly" ? (
              <>
                <label className="field">
                  <span>Monthly Mode</span>
                  <select
                    value={monthlyMode}
                    onChange={(event) => setMonthlyMode(event.target.value as "dayOfMonth" | "nthWeekday")}
                  >
                    <option value="dayOfMonth">Day of Month</option>
                    <option value="nthWeekday">Nth Weekday</option>
                  </select>
                </label>
                <label className="field">
                  <span>Day of Month</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dayOfMonth}
                    onChange={(event) => setDayOfMonth(Number(event.target.value) || 1)}
                    disabled={monthlyMode !== "dayOfMonth"}
                  />
                </label>
                <div className="two-col">
                  <label className="field">
                    <span>Nth Weekday</span>
                    <select
                      value={nthWeekday}
                      disabled={monthlyMode !== "nthWeekday"}
                      onChange={(event) => setNthWeekday(Number(event.target.value) as 1 | 2 | 3 | 4 | -1)}
                    >
                      <option value={1}>1st</option>
                      <option value={2}>2nd</option>
                      <option value={3}>3rd</option>
                      <option value={4}>4th</option>
                      <option value={-1}>Last</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Weekday</span>
                    <select
                      value={nthWeekdayDay}
                      disabled={monthlyMode !== "nthWeekday"}
                      onChange={(event) => setNthWeekdayDay(Number(event.target.value))}
                    >
                      {weekdayLabels.map((label, index) => (
                        <option key={label} value={index}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            ) : null}
          </>
        )}

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn-primary">Save Task</button>
      </form>
    </section>
  );
};
