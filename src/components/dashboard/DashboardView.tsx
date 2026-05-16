"use client";

import { useMemo } from "react";
import FinanceCard from "./FinanceCard";
import HabitsCard from "./HabitsCard";
import TasksCard from "./TasksCard";
import JournalCard from "./JournalCard";
import StatCard from "./StatCard";
import SpendingDonut from "./SpendingDonut";
import HabitMonthChart from "./HabitMonthChart";
import Card from "@/components/ui/Card";
import AppShell from "@/components/layout/AppShell";
import { formatCRC } from "@/lib/format";
import { useExpenses } from "@/hooks/useExpenses";
import { useHabits } from "@/hooks/useHabits";
import { useTasks } from "@/hooks/useTasks";
import { useJournalEntries } from "@/hooks/useJournalEntries";

export default function DashboardView({
  userId,
  userEmail
}: {
  userId: string;
  userEmail: string;
}) {
  const { expenses } = useExpenses(userId);
  const { habits, metrics, toggleHabitToday } = useHabits(userId);
  const { tasks, pendingCount, toggleTask } = useTasks(userId);
  const { entries } = useJournalEntries(userId);

  const summary = useMemo(() => {
    const habitsDone = habits.filter((habit) =>
      habit.habit_logs.some(
        (log) => log.date === new Date().toISOString().slice(0, 10) && log.completed
      )
    ).length;
    const spent = expenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const totalBudget = spent > 0 ? spent / 0.34 : 745000;
    const budgetLeft = Math.max(totalBudget - spent, 0);
    const dueToday = tasks.filter(
      (task) =>
        task.status === "Pending" &&
        task.due_date &&
        new Date(task.due_date).toDateString() === new Date().toDateString()
    ).length;
    const weekStreak = metrics.weekDots.filter((dot) => dot === "on").length;

    return {
      habitsDone,
      habitsTotal: Math.max(habits.length, 1),
      budgetLeft,
      dueToday,
      weekStreak
    };
  }, [expenses, habits, metrics.weekDots, tasks]);

  const spendingBreakdown = useMemo(() => {
    const grouped = expenses.reduce<Record<string, number>>((acc, item) => {
      const key = item.category || "Other";
      acc[key] = (acc[key] ?? 0) + Number(item.amount);
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((acc, value) => acc + value, 0) || 1;
    const data = [
      { name: "Food", value: grouped.food ?? grouped.Food ?? 0 },
      { name: "Transport", value: grouped.transport ?? grouped.Transport ?? 0 },
      { name: "Groceries", value: grouped.groceries ?? grouped.Groceries ?? 0 }
    ];
    const known = data.reduce((acc, item) => acc + item.value, 0);
    data.push({ name: "Other", value: Math.max(total - known, 0) });
    return data.map((item) => ({
      ...item,
      value: Math.round((item.value / total) * 100)
    }));
  }, [expenses]);

  return (
    <AppShell userId={userId} userEmail={userEmail} title="COMMAND CENTER">
      <section className="nx-stats-row">
            <StatCard
              tone="cyan"
              label="Habits Done"
              value={`${summary.habitsDone}`}
              subValue={`/${summary.habitsTotal}`}
              footerLabel="Today"
              badgeText={`${metrics.todayPct}%`}
              badgeTone="up"
            />
            <StatCard
              tone="orange"
              label="Budget Left"
              value={formatCRC(summary.budgetLeft)}
              footerLabel="34% spent"
              badgeText="On track"
              badgeTone="info"
            />
            <StatCard
              tone="red"
              label="Open Tasks"
              value={`${pendingCount}`}
              footerLabel={`${summary.dueToday} due today`}
              badgeText="Urgent"
              badgeTone="warn"
            />
            <StatCard
              tone="green"
              label="Week Streak"
              value={`${summary.weekStreak}`}
              subValue="d"
              footerLabel="Best: 12d"
              badgeText="Active"
              badgeTone="up"
            />
      </section>

      <section className="nx-main-grid">
        <div id="finance">
          <FinanceCard expenses={expenses} />
        </div>
        <div id="habits">
          <HabitsCard
            habits={habits}
            todayPct={metrics.todayPct}
            weekPct={metrics.weekPct}
            monthPct={metrics.monthPct}
            weekDots={metrics.weekDots}
            weekLineData={metrics.weekLineData}
            onToggleHabit={toggleHabitToday}
          />
        </div>
        <div className="nx-right-col">
          <div id="tasks">
            <TasksCard tasks={tasks} onToggleTask={toggleTask} />
          </div>
          <div id="journal">
            <JournalCard entries={entries} />
          </div>
        </div>
      </section>

      <section id="analytics">
        <div className="nx-section-header">
          <h3 className="nx-section-title">ANALYTICS</h3>
          <div className="nx-section-line" />
          <span className="nx-section-badge">
            {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="nx-analytics-row">
          <Card title="SPENDING BREAKDOWN" subtitle="By category · this month">
            <div className="nx-card-body">
              <div className="nx-chart-legend">
                {spendingBreakdown.map((item) => (
                  <span className="nx-legend-item" key={item.name}>
                    <span className={`nx-legend-sq ${item.name.toLowerCase()}`} />
                    {item.name} {item.value}%
                  </span>
                ))}
              </div>
              <SpendingDonut data={spendingBreakdown} />
            </div>
          </Card>
          <Card title="HABIT COMPLETION" subtitle="% per day · this month">
            <div className="nx-card-body">
              <HabitMonthChart data={metrics.monthData} />
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
