import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { FilterChips } from "../components/FilterChips";
import { DifficultySort } from "../app/types";
import { useSkinnerStore } from "../app/store";
import { filterTasksByDifficulty } from "../lib/tasks/sortTasks";
import { DifficultyBadge } from "../components/DifficultyBadge";

const sortOptions: Array<{ value: DifficultySort; label: string }> = [
  { value: "default", label: "Default" },
  { value: "difficulty_asc", label: "Difficulty Asc" },
  { value: "difficulty_desc", label: "Difficulty Desc" },
  { value: "due_date", label: "Due Date" }
];

export const Tasks = () => {
  const tasks = useSkinnerStore((state) => state.tasks);
  const difficultyFilter = useSkinnerStore((state) => state.difficultyFilter);
  const setDifficultyFilter = useSkinnerStore((state) => state.setDifficultyFilter);
  const difficultySort = useSkinnerStore((state) => state.prefs.difficultySort);
  const setDifficultySort = useSkinnerStore((state) => state.setDifficultySort);
  const archiveTask = useSkinnerStore((state) => state.archiveTask);
  const deleteTask = useSkinnerStore((state) => state.deleteTask);

  const visible = useMemo(() => filterTasksByDifficulty(tasks, difficultyFilter), [tasks, difficultyFilter]);

  return (
    <section className="screen">
      <TopBar title="Tasks" rightSlot={<Link className="btn-primary" to="/task/new">New</Link>} />

      <FilterChips value={difficultyFilter} onChange={setDifficultyFilter} />

      <label className="field">
        <span>Sort</span>
        <select value={difficultySort} onChange={(event) => setDifficultySort(event.target.value as DifficultySort)}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      {visible.length === 0 ? (
        <EmptyState title="No tasks yet" body="Create a routine or deadline task to populate your catalog." />
      ) : (
        <div className="task-catalog">
          {visible.map((task) => (
            <article key={task.id} className={task.archivedAtIso ? "task-card archived" : "task-card"}>
              <div className="task-title-row">
                <h3>{task.title}</h3>
                <DifficultyBadge difficulty={task.difficulty} />
              </div>
              <p className="task-meta">
                <span>{task.kind}</span>
                {task.dueAtIso ? <span>{new Date(task.dueAtIso).toLocaleString()}</span> : null}
                {task.archivedAtIso ? <span>Archived</span> : <span>Active</span>}
              </p>
              <div className="task-actions">
                <Link className="btn-edit" to={`/task/${task.id}/edit`}>Edit</Link>
                {!task.archivedAtIso ? (
                  <button type="button" className="btn-ghost" onClick={() => archiveTask(task.id)}>Archive</button>
                ) : null}
                <button type="button" className="btn-danger" onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
