import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { TaskRow } from "../components/TaskRow";
import { EmptyState } from "../components/EmptyState";
import { FilterChips } from "../components/FilterChips";
import { useSkinnerStore, selectSortedOccurrences } from "../app/store";
import { getDueBucket } from "../lib/schedule/dueState";

export const Dashboard = () => {
  const tasks = useSkinnerStore((state) => state.tasks);
  const difficultyFilter = useSkinnerStore((state) => state.difficultyFilter);
  const setDifficultyFilter = useSkinnerStore((state) => state.setDifficultyFilter);
  const markOccurrenceComplete = useSkinnerStore((state) => state.markOccurrenceComplete);
  const state = useSkinnerStore((snapshot) => snapshot);
  const nowIso = new Date().toISOString();

  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const sorted = useMemo(() => selectSortedOccurrences(state, nowIso), [state, nowIso]);
  const filtered = useMemo(() => {
    return sorted.filter((occurrence) => {
      const task = taskMap.get(occurrence.taskId);
      if (!task) {
        return false;
      }
      if (difficultyFilter === "all") {
        return true;
      }
      return task.difficulty === difficultyFilter;
    });
  }, [sorted, taskMap, difficultyFilter]);

  const groups = useMemo(() => {
    const overdue = filtered.filter((occurrence) => getDueBucket(occurrence, nowIso) === "overdue" && !occurrence.completedAtIso);
    const today = filtered.filter((occurrence) => getDueBucket(occurrence, nowIso) === "due_today" && !occurrence.completedAtIso);
    const later = filtered.filter((occurrence) => {
      const bucket = getDueBucket(occurrence, nowIso);
      return !occurrence.completedAtIso && (bucket === "upcoming" || bucket === "later");
    });
    return { overdue, today, later };
  }, [filtered, nowIso]);

  const renderRows = (occurrenceIds: typeof groups.overdue) => {
    return occurrenceIds.map((occurrence) => {
      const task = taskMap.get(occurrence.taskId);
      if (!task) {
        return null;
      }
      return (
        <TaskRow
          key={occurrence.occurrenceId}
          task={task}
          occurrence={occurrence}
          onComplete={() => markOccurrenceComplete(task.id, occurrence.occurrenceId)}
        />
      );
    });
  };

  return (
    <section className="screen">
      <TopBar title="Today" rightSlot={<Link className="btn-primary" to="/task/new">New</Link>} />
      <FilterChips value={difficultyFilter} onChange={setDifficultyFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing queued right now"
          body="Add a recurring routine or deadline task to start building momentum."
        />
      ) : (
        <div className="section-stack">
          <section>
            <h2>Overdue</h2>
            {groups.overdue.length === 0 ? <p className="muted">No overdue items.</p> : renderRows(groups.overdue)}
          </section>
          <section>
            <h2>Today</h2>
            {groups.today.length === 0 ? <p className="muted">No tasks due today.</p> : renderRows(groups.today)}
          </section>
          <section>
            <h2>Later</h2>
            {groups.later.length === 0 ? <p className="muted">No upcoming items.</p> : renderRows(groups.later)}
          </section>
        </div>
      )}
    </section>
  );
};
