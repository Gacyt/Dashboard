"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import QuickAddInput from "@/components/ui/QuickAddInput";
import { Task } from "@/lib/types";

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
  onToggleTask,
  onAddTask
}: {
  tasks: Task[];
  onToggleTask: (task: Task) => Promise<void>;
  onAddTask: (title: string) => Promise<void>;
}) {
  const [quickTask, setQuickTask] = useState("");

  return (
    <Card
      title="TASKS"
      subtitle={`${tasks.filter((task) => task.status === "Pending").length} pending`}
      action={<button className="nx-card-action">+ Add</button>}
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
      <QuickAddInput
        placeholder="Add new task..."
        value={quickTask}
        onChange={setQuickTask}
        buttonLabel="+ Task"
        onClick={async () => {
          if (!quickTask.trim()) return;
          await onAddTask(quickTask.trim());
          setQuickTask("");
        }}
      />
    </Card>
  );
}
