"use client";

import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { Habit } from "@/lib/types";

type HabitsModuleProps = {
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
};

export default function HabitsModule({ habits, onToggleHabit }: HabitsModuleProps) {
  return (
    <ModuleCard title="Habits" subtitle="Daily consistency">
      {habits.length === 0 ? (
        <p className={styles.empty}>No habits tracked yet.</p>
      ) : (
        <ul className={styles.list}>
          {habits.slice(0, 5).map((habit) => {
            const completedToday = habit.habit_logs.some(
              (entry) => entry.date === new Date().toISOString().slice(0, 10) && entry.completed
            );
            const completedCount = habit.habit_logs.filter((entry) => entry.completed).length;
            const progress = Math.min(
              100,
              Math.round((completedCount / Math.max(habit.target_per_day, 1)) * 100)
            );

            return (
              <li key={habit.id} className={styles.listItem}>
                <div style={{ width: "100%" }}>
                  <p>{habit.name}</p>
                  <p className={styles.muted}>Target/day: {habit.target_per_day}</p>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleHabit(habit.id)}
                  className={`${styles.checkButton} ${completedToday ? styles.checkButtonActive : ""}`}
                >
                  {completedToday ? "Done" : "Check"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </ModuleCard>
  );
}

