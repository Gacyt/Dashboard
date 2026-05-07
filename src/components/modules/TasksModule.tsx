"use client";

import { FormEvent, useState } from "react";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { Task } from "@/lib/types";

type TasksModuleProps = {
  tasks: Task[];
  onCreateTask: (payload: {
    title: string;
    description: string;
    due_date: string | null;
  }) => Promise<void>;
  onUpdateTask: (
    taskId: string,
    payload: { title?: string; description?: string; due_date?: string | null; status?: "Pending" | "Completed" }
  ) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
};

export default function TasksModule({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}: TasksModuleProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<"All" | "Pending" | "Completed">("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const filteredTasks = tasks.filter((task) => filter === "All" || task.status === filter);
  const pendingCount = tasks.filter((task) => task.status === "Pending").length;
  const completedCount = tasks.filter((task) => task.status === "Completed").length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const submitTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    await onCreateTask({
      title,
      description,
      due_date: dueDate || null
    });
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
  };

  const saveEdit = async (taskId: string) => {
    await onUpdateTask(taskId, {
      title: editTitle,
      description: editDescription,
      due_date: editDueDate || null
    });
    setEditingId(null);
  };

  return (
    <ModuleCard title="Tasks" subtitle="Priorities and due dates">
      <div className={styles.valueGrid}>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Pending tasks</p>
          <p className={styles.valueText}>{pendingCount}</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Completed tasks</p>
          <p className={styles.valueText}>{completedCount}</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Progress</p>
          <p className={styles.valueText}>{progress}%</p>
        </div>
      </div>

      <form className={styles.formGrid} onSubmit={submitTask}>
        <input
          className={styles.input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
          required
        />
        <input
          className={styles.input}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
        <input
          className={styles.input}
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <button className={styles.actionButton} type="submit">
          Add Task
        </button>
      </form>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => setFilter("All")}
        >
          All
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => setFilter("Pending")}
        >
          Pending
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => setFilter("Completed")}
        >
          Completed
        </button>
      </div>

      {filteredTasks.length === 0 ? <p className={styles.empty}>No tasks yet.</p> : null}

      <ul className={styles.list}>
        {filteredTasks.slice(0, 10).map((task) => (
          <li className={styles.listItem} key={task.id}>
            <div className={styles.flexGrow}>
              {editingId === task.id ? (
                <div className={styles.formGrid}>
                  <input
                    className={styles.input}
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                  <input
                    className={styles.input}
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="date"
                    value={editDueDate}
                    onChange={(event) => setEditDueDate(event.target.value)}
                  />
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.actionButton}
                      type="button"
                      onClick={() => saveEdit(task.id)}
                    >
                      Save
                    </button>
                    <button
                      className={styles.actionButton}
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{task.title}</p>
                  <p className={styles.muted}>{task.description || "No description"}</p>
                  <p className={styles.muted}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                  </p>
                </>
              )}
            </div>
            <div className={styles.buttonColumn}>
              <button
                type="button"
                onClick={() =>
                  onUpdateTask(task.id, {
                    status: task.status === "Completed" ? "Pending" : "Completed"
                  })
                }
                className={`${styles.checkButton} ${
                  task.status === "Completed" ? styles.checkButtonActive : ""
                }`}
              >
                {task.status}
              </button>
              <button
                type="button"
                onClick={() => startEdit(task)}
                className={styles.checkButton}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                className={styles.checkButton}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </ModuleCard>
  );
}

