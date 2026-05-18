"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import HabitLineChart from "./HabitLineChart";
import { Habit } from "@/lib/types";
import { openCreateHub } from "@/lib/createHub";

export default function HabitsCard({
  habits,
  todayPct,
  weekPct,
  monthPct,
  weekDots,
  weekLineData,
  onToggleHabit
}: {
  habits: Habit[];
  todayPct: number;
  weekPct: number;
  monthPct: number;
  weekDots: Array<"on" | "warn" | "off">;
  weekLineData: Array<{ day: string; pct: number }>;
  onToggleHabit: (habit: Habit) => Promise<void>;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const visualHabits = useMemo(
    () =>
      habits.slice(0, 6).map((habit) => {
        const done = habit.habit_logs.some((log) => log.date === today && log.completed);
        const streak = habit.habit_logs.filter((log) => log.completed).length;
        return { ...habit, done, streak };
      }),
    [habits, today]
  );

  return (
    <Card
      title="Daily habits"
      subtitle={`${visualHabits.filter((item) => item.done).length} of ${Math.max(visualHabits.length, 1)} complete`}
      action={
        <button className="nx-card-action" type="button" onClick={() => openCreateHub("habit")}>
          Add Habit
        </button>
      }
    >
      <div className="nx-habit-summary">
        <div className="nx-habit-stat">
          <p className="nx-hstat-val">{todayPct}%</p>
          <p className="nx-hstat-label">Today</p>
          <span className="nx-hstat-badge green">Good</span>
        </div>
        <div className="nx-habit-stat">
          <p className="nx-hstat-val">{weekPct}%</p>
          <p className="nx-hstat-label">This Week</p>
          <div className="nx-week-dots">
            {weekDots.map((dot, index) => (
              <span className={`nx-wd ${dot}`} key={`${dot}-${index}`} />
            ))}
          </div>
        </div>
        <div className="nx-habit-stat">
          <p className="nx-hstat-val">{monthPct}%</p>
          <p className="nx-hstat-label">This Month</p>
          <span className="nx-hstat-badge cyan">+6% vs last</span>
        </div>
      </div>

      <div className="nx-habit-list">
        {visualHabits.length ? (
          visualHabits.map((habit) => (
            <button
              className={`nx-habit-item ${habit.done ? "done" : ""}`}
              key={habit.id}
              type="button"
              onClick={() => onToggleHabit(habit)}
            >
              <span className={`nx-habit-check ${habit.done ? "done" : ""}`} />
              <span>
                <span className="nx-habit-name">{habit.name}</span>
                <span className="nx-habit-streak">{habit.streak}d streak</span>
              </span>
            </button>
          ))
        ) : (
          <div className="nx-empty">No habits configured yet. Add one to start a visible streak.</div>
        )}
      </div>

      <div className="nx-habit-chart-wrap">
        <p className="nx-list-label">Habit % — This Week</p>
        <HabitLineChart data={weekLineData} />
      </div>
    </Card>
  );
}
