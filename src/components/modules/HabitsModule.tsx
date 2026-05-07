"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { Habit } from "@/lib/types";

type HabitsModuleProps = {
  habits: Habit[];
  onCreateHabit: (payload: { name: string; target_per_day: number }) => Promise<void>;
  onUpdateHabit: (
    habitId: string,
    payload: { name?: string; target_per_day?: number }
  ) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
  onLogHabit: (
    habitId: string,
    payload?: { date?: string; completed?: boolean }
  ) => Promise<void>;
};

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function HabitsModule({
  habits,
  onCreateHabit,
  onUpdateHabit,
  onDeleteHabit,
  onLogHabit
}: HabitsModuleProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("1");

  const metrics = useMemo(() => {
    const today = new Date();
    const todayKey = formatDay(today);
    const dayStats = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));
      const key = formatDay(day);
      const completed = habits.reduce((count, habit) => {
        const done = habit.habit_logs.some((entry) => entry.date === key && entry.completed);
        return count + (done ? 1 : 0);
      }, 0);
      return {
        day: key.slice(5),
        completion: habits.length ? Math.round((completed / habits.length) * 100) : 0
      };
    });

    const monthStats = Array.from({ length: 30 }).map((_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (29 - index));
      const key = formatDay(day);
      const completed = habits.reduce((count, habit) => {
        const done = habit.habit_logs.some((entry) => entry.date === key && entry.completed);
        return count + (done ? 1 : 0);
      }, 0);
      return {
        day: key.slice(8),
        completion: habits.length ? Math.round((completed / habits.length) * 100) : 0
      };
    });

    const completedToday = habits.reduce((count, habit) => {
      const done = habit.habit_logs.some(
        (entry) => entry.date === todayKey && entry.completed
      );
      return count + (done ? 1 : 0);
    }, 0);

    const totalLogs = habits.reduce((count, habit) => count + habit.habit_logs.length, 0);
    const completedLogs = habits.reduce(
      (count, habit) => count + habit.habit_logs.filter((entry) => entry.completed).length,
      0
    );
    const overallScore = totalLogs ? Math.round((completedLogs / totalLogs) * 100) : 0;

    const weeklyCompletion = dayStats.length
      ? Math.round(dayStats.reduce((sum, day) => sum + day.completion, 0) / dayStats.length)
      : 0;
    const monthlyCompletion = monthStats.length
      ? Math.round(monthStats.reduce((sum, day) => sum + day.completion, 0) / monthStats.length)
      : 0;

    return {
      dayStats,
      monthStats,
      weeklyCompletion,
      monthlyCompletion,
      overallScore,
      todayCompletion: habits.length ? Math.round((completedToday / habits.length) * 100) : 0
    };
  }, [habits]);

  const todayKey = formatDay(new Date());

  const submitHabit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    await onCreateHabit({
      name,
      target_per_day: Math.max(1, Number(target))
    });
    setName("");
    setTarget("1");
  };

  return (
    <ModuleCard title="Habits" subtitle="Daily consistency">
      <div className={styles.valueGrid}>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Weekly Habit Completion</p>
          <p className={styles.valueText}>{metrics.weeklyCompletion}%</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Monthly Habit Completion</p>
          <p className={styles.valueText}>{metrics.monthlyCompletion}%</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Today Completion %</p>
          <p className={styles.valueText}>{metrics.todayCompletion}%</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Overall Score</p>
          <p className={styles.valueText}>{metrics.overallScore}%</p>
        </div>
      </div>

      <form className={styles.formGrid} onSubmit={submitHabit}>
        <input
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Habit name"
          required
        />
        <input
          className={styles.input}
          type="number"
          min="1"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="Target per day"
          required
        />
        <button className={styles.actionButton} type="submit">
          Add Habit
        </button>
      </form>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.dayStats}>
            <XAxis dataKey="day" tick={{ fill: "#767676", fontSize: 11 }} />
            <YAxis tick={{ fill: "#767676", fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="completion" fill="#EB0004" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.monthStats}>
            <XAxis dataKey="day" tick={{ fill: "#767676", fontSize: 10 }} />
            <YAxis tick={{ fill: "#767676", fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="completion" fill="#5135CD" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {habits.length === 0 ? (
        <p className={styles.empty}>No habits tracked yet.</p>
      ) : (
        <ul className={styles.list}>
          {habits.slice(0, 8).map((habit) => {
            const completedToday = habit.habit_logs.some(
              (entry) => entry.date === todayKey && entry.completed
            );
            const completedCount = habit.habit_logs.filter((entry) => entry.completed).length;
            const progress = Math.min(
              100,
              Math.round((completedCount / Math.max(habit.target_per_day, 1)) * 100)
            );

            return (
              <li key={habit.id} className={styles.listItem}>
                <div className={styles.flexGrow}>
                  <p>{habit.name}</p>
                  <p className={styles.muted}>Target/day: {habit.target_per_day}</p>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className={styles.buttonColumn}>
                  <button
                    type="button"
                    onClick={() => onLogHabit(habit.id, { date: todayKey, completed: !completedToday })}
                    className={`${styles.checkButton} ${
                      completedToday ? styles.checkButtonActive : ""
                    }`}
                  >
                    {completedToday ? "Done" : "Check"}
                  </button>
                  <button
                    type="button"
                    className={styles.checkButton}
                    onClick={() => {
                      const habitName = window.prompt("Habit name", habit.name);
                      if (!habitName) return;
                      const habitTarget = window.prompt(
                        "Target per day",
                        String(habit.target_per_day)
                      );
                      if (!habitTarget) return;
                      onUpdateHabit(habit.id, {
                        name: habitName,
                        target_per_day: Number(habitTarget)
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.checkButton}
                    onClick={() => onDeleteHabit(habit.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ModuleCard>
  );
}

