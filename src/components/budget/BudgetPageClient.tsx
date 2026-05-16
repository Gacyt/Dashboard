"use client";

import { useMemo, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMonthlyBudget } from "@/hooks/useMonthlyBudget";
import { useToast } from "@/hooks/useToast";
import { formatCRC } from "@/lib/format";

export default function BudgetPageClient({ userId }: { userId: string }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { budget, allocation, saveCategoryBudgets, updateTotalBudget } = useMonthlyBudget(userId, month);
  const { pushToast } = useToast();

  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState("0");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const chartData = useMemo(
    () =>
      allocation.categoryRows.map((row) => ({
        name: row.category.name,
        value: row.allocated
      })),
    [allocation.categoryRows]
  );

  const displayedTotal = Number(budget?.total ?? 0);
  const editorTotal = allocation.categoryRows.reduce(
    (sum, row) => sum + Number(drafts[row.category.id] ?? row.allocated),
    0
  );

  const shiftMonth = (offset: number) => {
    const [yearText, monthText] = month.split("-");
    const date = new Date(Number(yearText), Number(monthText) - 1 + offset, 1);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    setDrafts({});
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "10px" }}>
          <h2 className="nx-card-title">Monthly Budget</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="nx-btn" type="button" onClick={() => shiftMonth(-1)}>←</button>
            <strong>{month}</strong>
            <button className="nx-btn" type="button" onClick={() => shiftMonth(1)}>→</button>
          </div>
        </div>

        {isEditingTotal ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <input className="nx-input" type="number" min="0" step="0.01" value={totalInput} onChange={(event) => setTotalInput(event.target.value)} />
            <button
              className="nx-btn primary"
              type="button"
              onClick={async () => {
                await updateTotalBudget(Number(totalInput || "0"));
                setIsEditingTotal(false);
                pushToast("Monthly budget updated.", "success");
              }}
            >
              Save
            </button>
          </div>
        ) : (
          <div className="nx-between">
            <p className="nx-fin-val">{formatCRC(displayedTotal)}</p>
            <button
              className="nx-btn"
              type="button"
              onClick={() => {
                setTotalInput(String(displayedTotal));
                setIsEditingTotal(true);
              }}
            >
              Edit
            </button>
          </div>
        )}
      </section>

      <section className="nx-panel">
        <h2 className="nx-card-title" style={{ marginBottom: "10px" }}>Category Allocation</h2>
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 280px" }}>
          <div style={{ display: "grid", gap: "8px" }}>
            {allocation.categoryRows.map((row) => (
              <div key={row.category.id} className="nx-panel" style={{ padding: "10px" }}>
                <div className="nx-between">
                  <strong>{row.category.name}</strong>
                  {row.isOver ? <span className="nx-badge orange">Over budget</span> : null}
                </div>
                <p className="nx-exp-cat">
                  Allocated: {formatCRC(row.allocated)} · Spent: {formatCRC(row.spent)} · Remaining: {formatCRC(row.remaining)}
                </p>
                <div className="nx-progress" style={{ marginTop: "5px" }}>
                  <span style={{ width: `${Math.min(row.pct, 100)}%`, background: row.isOver ? "var(--red)" : row.category.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="nx-panel" style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p style={{ marginTop: "8px", color: allocation.unallocated < 0 ? "var(--red)" : "var(--txt2)" }}>
          Unallocated: {formatCRC(allocation.unallocated)}
        </p>
      </section>

      <section className="nx-panel">
        <h2 className="nx-card-title" style={{ marginBottom: "10px" }}>Budget Editor</h2>
        <div style={{ display: "grid", gap: "8px" }}>
          {allocation.categoryRows.map((row) => (
            <div key={row.category.id} className="nx-between">
              <span>{row.category.name}</span>
              <input
                className="nx-input"
                style={{ maxWidth: "180px" }}
                type="number"
                min="0"
                step="0.01"
                value={drafts[row.category.id] ?? String(row.allocated)}
                onChange={(event) =>
                  setDrafts((prev) => ({ ...prev, [row.category.id]: event.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <div className="nx-between" style={{ marginTop: "12px" }}>
          <span>
            Running total: {formatCRC(editorTotal)}
            {editorTotal > displayedTotal ? (
              <span style={{ color: "var(--red)", marginLeft: "8px" }}>
                exceeds monthly budget
              </span>
            ) : null}
          </span>
          <button
            className="nx-btn primary"
            type="button"
            onClick={async () => {
              await saveCategoryBudgets(
                allocation.categoryRows.map((row) => ({
                  id: row.category.id,
                  monthly_budget: Number(drafts[row.category.id] ?? row.allocated)
                }))
              );
              pushToast("Category budgets saved.", "success");
            }}
          >
            Save All
          </button>
        </div>
      </section>
    </div>
  );
}
