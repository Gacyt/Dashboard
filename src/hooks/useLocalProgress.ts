"use client";

import { useMemo, useState } from "react";
import { Habit, Task } from "@/lib/types";

export function useLocalProgress(initialTasks: Task[], initialHabits: Habit[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const toggleTask = (taskId: string) => {
    setTasks((previous) =>
      previous.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().slice(0, 10);

    setHabits((previous) =>
      previous.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        const existing = habit.habit_logs.find((entry) => entry.date === today);
        if (existing) {
          return {
            ...habit,
            habit_logs: habit.habit_logs.map((entry) =>
              entry.date === today ? { ...entry, completed: !entry.completed } : entry
            )
          };
        }

        return {
          ...habit,
          habit_logs: [...habit.habit_logs, { date: today, completed: true }]
        };
      })
    );
  };

  const taskCompletion = useMemo(() => {
    if (!tasks.length) {
      return 0;
    }
    const completed = tasks.filter((task) => task.completed).length;
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

  return {
    tasks,
    habits,
    toggleTask,
    toggleHabit,
    taskCompletion,
    habitCompletion
  };
}

