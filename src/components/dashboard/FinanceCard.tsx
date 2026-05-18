"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import { Expense } from "@/lib/types";
import { formatCRC } from "@/lib/format";
import { openCreateHub } from "@/lib/createHub";

export default function FinanceCard({
  expenses
}: {
  expenses: Expense[];
}) {
  const finance = useMemo(() => {
    const spent = expenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const totalBudget = spent > 0 ? spent / 0.34 : 745000;
    const remaining = Math.max(totalBudget - spent, 0);
    const usedPct = totalBudget ? Math.min(Math.round((spent / totalBudget) * 100), 100) : 0;
    return { spent, remaining, totalBudget, usedPct };
  }, [expenses]);

  return (
    <Card
      title="Finance"
      subtitle="Current month · CRC"
      action={
        <button className="nx-card-action" type="button" onClick={() => openCreateHub("expense")}>
          Add Expense
        </button>
      }
    >
      <div className="nx-card-body">
        <div className="nx-fin-grid">
          <div className="nx-fin-box">
            <p className="nx-fin-label">Spent</p>
            <p className="nx-fin-val spent">{formatCRC(finance.spent)}</p>
            <div className="nx-budget-bar">
              <div className="nx-budget-fill orange" style={{ width: `${finance.usedPct}%` }} />
            </div>
          </div>
          <div className="nx-fin-box">
            <p className="nx-fin-label">Remaining</p>
            <p className="nx-fin-val remain">{formatCRC(finance.remaining)}</p>
            <div className="nx-budget-bar">
              <div className="nx-budget-fill green" style={{ width: `${100 - finance.usedPct}%` }} />
            </div>
          </div>
          <div className="nx-fin-box full">
            <p className="nx-fin-label">Monthly Budget</p>
            <div className="nx-between">
              <p className="nx-fin-val">{formatCRC(finance.totalBudget)}</p>
              <span className="nx-stat-badge info">{finance.usedPct}% used</span>
            </div>
            <div className="nx-budget-bar big">
              <div className="nx-budget-fill accent" style={{ width: `${finance.usedPct}%` }} />
            </div>
          </div>
        </div>

        <p className="nx-list-label">Recent Expenses</p>
        {expenses.length ? (
          <div className="nx-exp-list">
            {expenses.slice(0, 3).map((expense) => (
              <div className="nx-exp-row" key={expense.id}>
                <div className="nx-exp-ic">₡</div>
                <div className="nx-flex-1">
                  <p className="nx-exp-name">{expense.description || "Expense"}</p>
                  <p className="nx-exp-cat">
                    {expense.category} · {new Date(expense.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="nx-exp-amt">-{formatCRC(Number(expense.amount))}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="nx-empty">
            No expenses yet. Capture your first expense to activate finance analytics.
            <div style={{ marginTop: "8px" }}>
              <button className="nx-btn primary" type="button" onClick={() => openCreateHub("expense")}>
                Add first expense
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
