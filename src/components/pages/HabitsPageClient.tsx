"use client";

import { useHabits } from "@/hooks/useHabits";
import HabitsCard from "@/components/dashboard/HabitsCard";

export default function HabitsPageClient({ userId }: { userId: string }) {
  const { habits, metrics, toggleHabitToday } = useHabits(userId);

  return (
    <section className="nx-panel animate-fade-in-up">
      <HabitsCard
        habits={habits}
        todayPct={metrics.todayPct}
        weekPct={metrics.weekPct}
        monthPct={metrics.monthPct}
        weekDots={metrics.weekDots}
        weekLineData={metrics.weekLineData}
        onToggleHabit={toggleHabitToday}
      />
    </section>
  );
}
