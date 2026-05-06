"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { Budget, Expense } from "@/lib/types";

type FinanceModuleProps = {
  expenses: Expense[];
  budget: Budget | null;
};

export default function FinanceModule({ expenses, budget }: FinanceModuleProps) {
  const summary = useMemo(() => {
    const grouped = new Map<string, number>();
    let total = 0;

    for (const expense of expenses) {
      const amount = Number(expense.amount);
      total += amount;
      grouped.set(expense.category, (grouped.get(expense.category) ?? 0) + amount);
    }

    const chartData = Array.from(grouped.entries())
      .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const budgetLimit = Number(budget?.limit_amount ?? 0);
    const remaining = budgetLimit > 0 ? budgetLimit - total : 0;

    return {
      chartData,
      total: Number(total.toFixed(2)),
      budgetLimit,
      remaining: Number(remaining.toFixed(2))
    };
  }, [expenses, budget]);

  return (
    <ModuleCard title="Finance" subtitle="Expense flow and budget">
      <div className={styles.valueGrid}>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Spent</p>
          <p className={styles.valueText}>${summary.total.toLocaleString()}</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Remaining</p>
          <p className={styles.valueText}>${summary.remaining.toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summary.chartData}>
            <XAxis dataKey="category" tick={{ fill: "#767676", fontSize: 11 }} />
            <YAxis tick={{ fill: "#767676", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#000",
                border: "1px solid #767676",
                color: "#dfdfdf"
              }}
            />
            <Bar dataKey="amount" fill="#EB0004" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  );
}

