"use client";

import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { Task } from "@/lib/types";

type TasksModuleProps = {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
};

export default function TasksModule({ tasks, onToggleTask }: TasksModuleProps) {
  return (
    <ModuleCard title="Tasks" subtitle="Priorities and due dates">
      {tasks.length === 0 ? (
        <p className={styles.empty}>No tasks yet.</p>
      ) : (
        <ul className={styles.list}>
          {tasks.slice(0, 6).map((task) => (
            <li className={styles.listItem} key={task.id}>
              <div>
                <p>{task.title}</p>
                <p className={styles.muted}>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className={`${styles.checkButton} ${task.completed ? styles.checkButtonActive : ""}`}
              >
                {task.completed ? "Done" : "Open"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}

