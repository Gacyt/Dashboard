"use client";

import { useEffect, useMemo, useState } from "react";
import { Habit } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { NX_CREATE_HUB_CREATED_EVENT } from "@/lib/createHub";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function useHabits(userId: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const refresh = () => {
      supabase
        .from("habits")
        .select("id, name, target_per_day, created_at, habit_logs(id, date, completed)")
        .eq("user_id", userId)
        .order("name", { ascending: true })
        .then(({ data }) => setHabits((data ?? []) as Habit[]));
    };

    const onCreated = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string }>).detail;
      if (detail?.kind === "habit") {
        refresh();
      }
    };

    refresh();
    window.addEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);

    return () => {
      window.removeEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);
    };
  }, [supabase, userId]);

  const metrics = useMemo(() => {
    const today = new Date();
    const todayId = dayKey(today);

    const habitDoneToday = habits.filter((habit) =>
      habit.habit_logs.some((log) => log.date === todayId && log.completed)
    ).length;
    const todayPct = habits.length ? Math.round((habitDoneToday / habits.length) * 100) : 0;

    const weekDates = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date;
    });
    const weekLineData = weekDates.map((date) => {
      const dateId = dayKey(date);
      const done = habits.filter((habit) =>
        habit.habit_logs.some((log) => log.date === dateId && log.completed)
      ).length;
      const pct = habits.length ? Math.round((done / habits.length) * 100) : 0;
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        pct
      };
    });

    const weekPct = weekLineData.length
      ? Math.round(weekLineData.reduce((acc, item) => acc + item.pct, 0) / weekLineData.length)
      : 0;

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthData = Array.from({ length: daysInMonth }).map((_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      const dateId = dayKey(date);
      const done = habits.filter((habit) =>
        habit.habit_logs.some((log) => log.date === dateId && log.completed)
      ).length;
      return {
        day: i + 1,
        pct: habits.length ? Math.round((done / habits.length) * 100) : 0
      };
    });

    const monthPct = monthData.length
      ? Math.round(monthData.reduce((acc, item) => acc + item.pct, 0) / monthData.length)
      : 0;

    const weekDots = weekLineData.map((item) =>
      item.pct >= 75 ? "on" : item.pct >= 50 ? "warn" : "off"
    );

    return { todayPct, weekPct, monthPct, weekDots, weekLineData, monthData };
  }, [habits]);

  const toggleHabitToday = async (habit: Habit) => {
    const today = dayKey(new Date());
    const existing = habit.habit_logs.find((log) => log.date === today);
    const completed = existing ? !existing.completed : true;

    await supabase.from("habit_logs").upsert(
      {
        id: existing?.id,
        habit_id: habit.id,
        date: today,
        completed
      },
      { onConflict: "habit_id,date" }
    );

    const { data } = await supabase
      .from("habits")
      .select("id, name, target_per_day, created_at, habit_logs(id, date, completed)")
      .eq("id", habit.id)
      .single();

    if (data) {
      setHabits((prev) => prev.map((item) => (item.id === habit.id ? (data as Habit) : item)));
    }
  };

  const addHabit = async (
    payload: string | { name: string; target_per_day?: number }
  ) => {
    const next =
      typeof payload === "string"
        ? { name: payload, target_per_day: 1 }
        : payload;

    if (!next.name.trim()) {
      return;
    }
    const { data } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: next.name.trim(),
        target_per_day: Math.max(1, Number(next.target_per_day ?? 1))
      })
      .select("id, name, target_per_day, created_at, habit_logs(id, date, completed)")
      .single();
    if (data) {
      setHabits((prev) => [...prev, data as Habit]);
    }
  };

  return { habits, metrics, toggleHabitToday, addHabit };
}
