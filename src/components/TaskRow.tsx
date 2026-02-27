import { Link } from "react-router-dom";
import { Task, TaskOccurrence } from "../app/types";
import { DifficultyBadge } from "./DifficultyBadge";

interface TaskRowProps {
  task: Task;
  occurrence: TaskOccurrence;
  onComplete: () => void;
}

const formatIso = (iso: string | null): string => {
  if (!iso) {
    return "No due date";
  }
  const date = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

export const TaskRow = ({ task, occurrence, onComplete }: TaskRowProps) => {
  const isDone = Boolean(occurrence.completedAtIso);
  return (
    <article className={isDone ? "task-row done" : "task-row"} data-testid={`task-row-${task.id}`}>
      <div className="task-main">
        <div className="task-title-row">
          <h3>{task.title}</h3>
          <DifficultyBadge difficulty={task.difficulty} />
        </div>
        {task.notes ? <p className="task-notes">{task.notes}</p> : null}
        <p className="task-meta">
          <span>{task.kind}</span>
          <span>{formatIso(occurrence.dueAtIso ?? occurrence.scheduledAtIso)}</span>
          {occurrence.isOverdue && !isDone ? <strong className="overdue">Overdue</strong> : null}
        </p>
      </div>
      <div className="task-actions">
        <button
          type="button"
          className="btn-complete"
          disabled={isDone}
          onClick={onComplete}
          aria-label={`Complete ${task.title}`}
        >
          {isDone ? "Done" : "Complete"}
        </button>
        <Link className="btn-edit" to={`/task/${task.id}/edit`}>
          Edit
        </Link>
      </div>
    </article>
  );
};
