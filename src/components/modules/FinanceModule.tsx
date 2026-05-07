"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { Budget, Expense } from "@/lib/types";
import { formatCRC } from "@/lib/format";

type FinanceModuleProps = {
  expenses: Expense[];
  budget: Budget | null;
  onCreateExpense: (payload: {
    amount: number;
    category: string;
    description: string;
    expense_type: "normal" | "extraordinary";
    date: string;
  }) => Promise<void>;
};

export default function FinanceModule({
  expenses,
  budget,
  onCreateExpense
}: FinanceModuleProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [expenseType, setExpenseType] = useState<"normal" | "extraordinary">("normal");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);

  const summary = useMemo(() => {
    const grouped = new Map<string, number>();
    let total = 0;
    let extraordinaryThisMonth = 0;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    for (const expense of expenses) {
      const amount = Number(expense.amount);
      total += amount;
      grouped.set(expense.category, (grouped.get(expense.category) ?? 0) + amount);
      const expenseDate = new Date(expense.created_at);
      const isThisMonth =
        expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      if (isThisMonth && expense.expense_type === "extraordinary") {
        extraordinaryThisMonth += amount;
      }
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
      remaining: Number(remaining.toFixed(2)),
      extraordinaryThisMonth: Number(extraordinaryThisMonth.toFixed(2))
    };
  }, [expenses, budget]);

  const submitExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    setIsSaving(true);
    try {
      await onCreateExpense({
        amount: parsedAmount,
        category,
        description,
        expense_type: expenseType,
        date
      });
      setAmount("");
      setDescription("");
      setExpenseType("normal");
      setDate(new Date().toISOString().slice(0, 10));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModuleCard title="Finance" subtitle="Expense flow and budget">
      <div className={styles.valueGrid}>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Spent</p>
          <p className={styles.valueText}>{formatCRC(summary.total)}</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Remaining</p>
          <p className={styles.valueText}>{formatCRC(summary.remaining)}</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Budget</p>
          <p className={styles.valueText}>{formatCRC(summary.budgetLimit)}</p>
        </div>
        <div className={styles.valueItem}>
          <p className={styles.valueLabel}>Extraordinary Expenses This Month</p>
          <p className={styles.valueText}>{formatCRC(summary.extraordinaryThisMonth)}</p>
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
              formatter={(value: number) => formatCRC(Number(value))}
            />
            <Bar dataKey="amount" fill="#EB0004" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <form className={styles.formGrid} onSubmit={submitExpense}>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Amount (CRC)"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        />
        <input
          className={styles.input}
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <select
          className={styles.select}
          value={expenseType}
          onChange={(event) =>
            setExpenseType(event.target.value as "normal" | "extraordinary")
          }
        >
          <option value="normal">normal</option>
          <option value="extraordinary">extraordinary</option>
        </select>
        <textarea
          className={styles.textarea}
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button className={styles.actionButton} type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Add Expense"}
        </button>
      </form>
    </ModuleCard>
  );
}

