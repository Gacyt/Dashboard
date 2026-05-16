"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import SpendingDonut from "@/components/dashboard/SpendingDonut";
import HabitMonthChart from "@/components/dashboard/HabitMonthChart";
import { useExpenses } from "@/hooks/useExpenses";
import { useHabits } from "@/hooks/useHabits";

export default function AnalyticsPageClient({ userId }: { userId: string }) {
  const { expenses } = useExpenses(userId);
  const { metrics } = useHabits(userId);

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
    <section className="nx-analytics-row animate-fade-in-up">
      <Card title="SPENDING BREAKDOWN" subtitle="By category · this month">
        <div className="nx-card-body">
          <SpendingDonut data={spendingBreakdown} />
        </div>
      </Card>
      <Card title="HABIT COMPLETION" subtitle="% per day · this month">
        <div className="nx-card-body">
          <HabitMonthChart data={metrics.monthData} />
        </div>
      </Card>
    </section>
  );
}
