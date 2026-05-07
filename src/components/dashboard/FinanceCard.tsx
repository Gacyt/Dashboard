"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import QuickAddInput from "@/components/ui/QuickAddInput";
import { Expense } from "@/lib/types";
import { formatCRC } from "@/lib/format";

export default function FinanceCard({
  expenses,
  onQuickAdd
}: {
  expenses: Expense[];
  onQuickAdd: (amount: number, description: string) => Promise<void>;
}) {
  const [quickAmount, setQuickAmount] = useState("");

  const finance = useMemo(() => {
    const spent = expenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const totalBudget = spent > 0 ? spent / 0.34 : 745000;
    const remaining = Math.max(totalBudget - spent, 0);
    const usedPct = totalBudget ? Math.min(Math.round((spent / totalBudget) * 100), 100) : 0;
    return { spent, remaining, totalBudget, usedPct };
  }, [expenses]);

  return (
    <Card title="FINANCE" subtitle="Current month — CRC" action={<button className="nx-card-action">+ Add</button>}>
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
        <div className="nx-exp-list">
          {(expenses.length ? expenses : []).slice(0, 3).map((expense) => (
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
      </div>

      <QuickAddInput
        placeholder="Amount in CRC..."
        value={quickAmount}
        onChange={setQuickAmount}
        buttonLabel="+ Expense"
        onClick={async () => {
          const amount = Number(quickAmount);
          if (!Number.isFinite(amount) || amount <= 0) {
            return;
          }
          await onQuickAdd(amount, "Quick expense");
          setQuickAmount("");
        }}
      />
    </Card>
  );
}
