import { useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { useSkinnerStore, selectSortedOccurrences } from "../app/store";
import { TaskRow } from "../components/TaskRow";

const PAGE_SIZE = 20;

export const Upcoming = () => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const tasks = useSkinnerStore((state) => state.tasks);
  const markOccurrenceComplete = useSkinnerStore((state) => state.markOccurrenceComplete);
  const state = useSkinnerStore((snapshot) => snapshot);
  const nowIso = new Date().toISOString();

  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const sorted = useMemo(() => selectSortedOccurrences(state, nowIso), [state, nowIso]);
  const upcomingOnly = useMemo(
    () => sorted.filter((occurrence) => new Date(occurrence.scheduledAtIso).getTime() >= new Date(nowIso).getTime()),
    [sorted, nowIso]
  );

  const visible = upcomingOnly.slice(0, visibleCount);

  return (
    <section className="screen">
      <TopBar title="Upcoming" />
      {upcomingOnly.length === 0 ? (
        <EmptyState title="No upcoming work" body="Upcoming occurrences appear here after tasks are created." />
      ) : (
        <>
          <div className="section-stack">
            {visible.map((occurrence) => {
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
            })}
          </div>
          {visible.length < upcomingOnly.length ? (
            <button type="button" className="btn-secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              Load more
            </button>
          ) : null}
        </>
      )}
    </section>
  );
};
