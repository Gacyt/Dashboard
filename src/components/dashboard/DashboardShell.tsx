"use client";

import { useMemo, useState } from "react";
import styles from "./dashboard.module.css";
import moduleStyles from "@/components/modules/modules.module.css";
import LogoutButton from "./LogoutButton";
import FinanceModule from "@/components/modules/FinanceModule";
import TasksModule from "@/components/modules/TasksModule";
import CalendarModule from "@/components/modules/CalendarModule";
import HabitsModule from "@/components/modules/HabitsModule";
import FitnessModule from "@/components/modules/FitnessModule";
import JournalModule from "@/components/modules/JournalModule";
import WebhookModule from "@/components/modules/WebhookModule";
import { DashboardData } from "@/lib/types";

type DashboardShellProps = {
  userEmail: string;
  data: DashboardData;
};

export default function DashboardShell({ userEmail, data }: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expenses, setExpenses] = useState(data.expenses);
  const [tasks, setTasks] = useState(data.tasks);
  const [habits, setHabits] = useState(data.habits);
  const [journalEntries, setJournalEntries] = useState(data.journalEntries);
  const [webhookToken, setWebhookToken] = useState(data.profile.webhook_token);

  const taskCompletion = useMemo(() => {
    if (!tasks.length) {
      return 0;
    }
    const completed = tasks.filter((task) => task.status === "Completed").length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const habitCompletion = useMemo(() => {
    if (!habits.length) {
      return 0;
    }
    const today = new Date().toISOString().slice(0, 10);
    const done = habits.filter((habit) =>
      habit.habit_logs.some((entry) => entry.date === today && entry.completed)
    ).length;
    return Math.round((done / habits.length) * 100);
  }, [habits]);

  async function requestJson(path: string, init?: RequestInit) {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Request failed");
    }
    return payload;
  }

  const createExpense = async (payload: {
    amount: number;
    category: string;
    description: string;
    expense_type: "normal" | "extraordinary";
    date: string;
  }) => {
    const result = await requestJson("/api/dashboard/expenses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setExpenses((prev) => [result.expense, ...prev]);
  };

  const createTask = async (payload: {
    title: string;
    description: string;
    due_date: string | null;
  }) => {
    const result = await requestJson("/api/dashboard/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setTasks((prev) => [result.task, ...prev]);
  };

  const updateTask = async (
    taskId: string,
    payload: { title?: string; description?: string; due_date?: string | null; status?: "Pending" | "Completed" }
  ) => {
    const result = await requestJson(`/api/dashboard/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    setTasks((prev) => prev.map((task) => (task.id === taskId ? result.task : task)));
  };

  const deleteTask = async (taskId: string) => {
    await requestJson(`/api/dashboard/tasks/${taskId}`, {
      method: "DELETE"
    });
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const createHabit = async (payload: { name: string; target_per_day: number }) => {
    const result = await requestJson("/api/dashboard/habits", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setHabits((prev) => [result.habit, ...prev]);
  };

  const updateHabit = async (
    habitId: string,
    payload: { name?: string; target_per_day?: number }
  ) => {
    const result = await requestJson(`/api/dashboard/habits/${habitId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    setHabits((prev) => prev.map((habit) => (habit.id === habitId ? result.habit : habit)));
  };

  const deleteHabit = async (habitId: string) => {
    await requestJson(`/api/dashboard/habits/${habitId}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  };

  const logHabit = async (
    habitId: string,
    payload?: { date?: string; completed?: boolean }
  ) => {
    const result = await requestJson(`/api/dashboard/habits/${habitId}/log`, {
      method: "POST",
      body: JSON.stringify(payload ?? {})
    });
    setHabits((prev) => prev.map((habit) => (habit.id === habitId ? result.habit : habit)));
  };

  const createJournalEntry = async (payload: {
    title: string;
    content: string;
    mood: "Great" | "Good" | "Neutral" | "Bad";
  }) => {
    const result = await requestJson("/api/dashboard/journal", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setJournalEntries((prev) => [result.entry, ...prev]);
  };

  const updateJournalEntry = async (
    entryId: string,
    payload: { title?: string; content?: string; mood?: "Great" | "Good" | "Neutral" | "Bad" }
  ) => {
    const result = await requestJson(`/api/dashboard/journal/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    setJournalEntries((prev) => prev.map((entry) => (entry.id === entryId ? result.entry : entry)));
  };

  const deleteJournalEntry = async (entryId: string) => {
    await requestJson(`/api/dashboard/journal/${entryId}`, {
      method: "DELETE"
    });
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const regenerateWebhookToken = async () => {
    const result = await requestJson("/api/dashboard/webhook/regenerate", {
      method: "POST"
    });
    setWebhookToken(result.webhook_token);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandWrap}>
          <span className={styles.brandDot} aria-hidden />
          <p className={styles.brand}>
            Nexus
            <br />
            [LifeOS]
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            Menu
          </button>
          <p className={styles.email}>{userEmail}</p>
          <LogoutButton />
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
          <p className={styles.sidebarTitle}>Modules</p>
          <nav className={styles.sidebarNav}>
            <a className={styles.sidebarLink} href="#finance">
              Finance
            </a>
            <a className={styles.sidebarLink} href="#tasks">
              Tasks
            </a>
            <a className={styles.sidebarLink} href="#calendar">
              Calendar
            </a>
            <a className={styles.sidebarLink} href="#habits">
              Habits
            </a>
            <a className={styles.sidebarLink} href="#fitness">
              Fitness
            </a>
            <a className={styles.sidebarLink} href="#journal">
              Journal
            </a>
            <a className={styles.sidebarLink} href="#webhook">
              Webhook
            </a>
            <a className={styles.sidebarLink} href="/dashboard/journal">
              Journal Page
            </a>
          </nav>
        </aside>

        <main className={styles.main}>
          <section className={styles.overviewGrid}>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Tasks completed</p>
              <p className={styles.overviewValue}>{taskCompletion}%</p>
            </article>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Habit consistency</p>
              <p className={styles.overviewValue}>{habitCompletion}%</p>
            </article>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Upcoming events</p>
              <p className={styles.overviewValue}>{data.events.length}</p>
            </article>
            <article className={styles.overviewCard}>
              <p className={styles.overviewLabel}>Journal entries</p>
              <p className={styles.overviewValue}>{journalEntries.length}</p>
            </article>
          </section>

          <section className={styles.moduleGrid}>
            <div id="finance" className={moduleStyles.anchor}>
              <FinanceModule
                expenses={expenses}
                budget={data.budget}
                onCreateExpense={createExpense}
              />
            </div>
            <div id="tasks" className={moduleStyles.anchor}>
              <TasksModule
                tasks={tasks}
                onCreateTask={createTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            </div>
            <div id="calendar" className={moduleStyles.anchor}>
              <CalendarModule events={data.events} />
            </div>
            <div id="habits" className={moduleStyles.anchor}>
              <HabitsModule
                habits={habits}
                onCreateHabit={createHabit}
                onUpdateHabit={updateHabit}
                onDeleteHabit={deleteHabit}
                onLogHabit={logHabit}
              />
            </div>
            <div id="fitness" className={moduleStyles.anchor}>
              <FitnessModule workouts={data.workouts} bodyMetrics={data.bodyMetrics} />
            </div>
            <div id="journal" className={moduleStyles.anchor}>
              <JournalModule
                journalEntries={journalEntries}
                onCreateEntry={createJournalEntry}
                onUpdateEntry={updateJournalEntry}
                onDeleteEntry={deleteJournalEntry}
              />
            </div>
            <div id="webhook" className={moduleStyles.anchor}>
              <WebhookModule
                webhookToken={webhookToken}
                onRegenerate={regenerateWebhookToken}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

