"use client";

import Card from "@/components/ui/Card";
import { Task } from "@/lib/types";
import { openCreateHub } from "@/lib/createHub";

function taskPriority(task: Task) {
  if (!task.due_date) return "low";
  const due = new Date(task.due_date).getTime();
  const now = Date.now();
  if (due <= now + 24 * 60 * 60 * 1000) return "high";
  if (due <= now + 3 * 24 * 60 * 60 * 1000) return "med";
  return "low";
}

export default function TasksCard({
  tasks,
  onToggleTask
}: {
  tasks: Task[];
  onToggleTask: (task: Task) => Promise<void>;
}) {
  return (
    <Card
      title="TASKS"
      subtitle={`${tasks.filter((task) => task.status === "Pending").length} pending`}
      action={
        <button className="nx-card-action" type="button" onClick={() => openCreateHub("task")}>
          Add Task
        </button>
      }
    >
      <div className="nx-task-list">
        {tasks.slice(0, 5).map((task) => {
          const priority = taskPriority(task);
          const isCompleted = task.status === "Completed";
          const isToday =
            task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();
          return (
            <button className="nx-task-row" key={task.id} type="button" onClick={() => onToggleTask(task)}>
              <span className={`nx-task-dot ${priority}`} />
              <span className={`nx-task-chk ${isCompleted ? "done" : ""}`} />
              <span className={`nx-task-txt ${isCompleted ? "done" : ""}`}>{task.title}</span>
              <span className={`nx-task-due ${isToday ? "urgent" : ""}`}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
