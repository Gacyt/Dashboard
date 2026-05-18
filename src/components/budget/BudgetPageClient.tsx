"use client";

import { useMemo, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Modal from "@/components/ui/Modal";
import { useMonthlyBudget } from "@/hooks/useMonthlyBudget";
import { useToast } from "@/hooks/useToast";
import { formatCRC } from "@/lib/format";

export default function BudgetPageClient({ userId }: { userId: string }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { budget, allocation, saveCategoryBudgets, updateTotalBudget } = useMonthlyBudget(userId, month);
  const { pushToast } = useToast();

  const [showTotalModal, setShowTotalModal] = useState(false);
  const [totalInput, setTotalInput] = useState("0");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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
        <div className="nx-between" style={{ marginBottom: "10px", gap: "10px", flexWrap: "wrap" }}>
          <h2 className="nx-card-title">Monthly budget</h2>
          <div className="nx-month-controls">
            <button className="nx-btn" type="button" onClick={() => shiftMonth(-1)}>
              ←
            </button>
            <strong>{month}</strong>
            <button className="nx-btn" type="button" onClick={() => shiftMonth(1)}>
              →
            </button>
          </div>
        </div>

        <div className="nx-between" style={{ gap: "8px", flexWrap: "wrap" }}>
          <p className="nx-fin-val">{formatCRC(displayedTotal)}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className="nx-btn"
              type="button"
              onClick={() => {
                setTotalInput(String(displayedTotal));
                setShowTotalModal(true);
              }}
            >
              Edit total
            </button>
            <button
              className="nx-btn primary"
              type="button"
              onClick={() => {
                const nextDrafts = allocation.categoryRows.reduce<Record<string, string>>((acc, row) => {
                  acc[row.category.id] = String(row.allocated);
                  return acc;
                }, {});
                setDrafts(nextDrafts);
                setShowCategoryModal(true);
              }}
            >
              Edit allocations
            </button>
          </div>
        </div>
      </section>

      <section className="nx-panel">
        <h2 className="nx-card-title" style={{ marginBottom: "10px" }}>
          Category allocation
        </h2>
        <div className="nx-doc-grid">
          <div style={{ display: "grid", gap: "8px" }}>
            {allocation.categoryRows.map((row) => (
              <div key={row.category.id} className="nx-panel" style={{ padding: "10px" }}>
                <div className="nx-between">
                  <strong>{row.category.name}</strong>
                  {row.isOver ? <span className="nx-badge orange">Over budget</span> : null}
                </div>
                <p className="nx-exp-cat">
                  Allocated: {formatCRC(row.allocated)} · Spent: {formatCRC(row.spent)} · Remaining:{" "}
                  {formatCRC(row.remaining)}
                </p>
                <div className="nx-progress" style={{ marginTop: "5px" }}>
                  <span
                    style={{
                      width: `${Math.min(row.pct, 100)}%`,
                      background: row.isOver ? "var(--red)" : row.category.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="nx-panel" style={{ minHeight: "280px" }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={66} outerRadius={108} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p style={{ marginTop: "8px", color: allocation.unallocated < 0 ? "var(--red)" : "var(--txt2)" }}>
          Unallocated: {formatCRC(allocation.unallocated)}
        </p>
      </section>

      <Modal
        open={showTotalModal}
        onClose={() => setShowTotalModal(false)}
        title="Edit monthly budget"
        description="Set the total budget envelope for this month."
      >
        <form
          className="nx-form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await updateTotalBudget(Number(totalInput || "0"));
            setShowTotalModal(false);
            pushToast("Monthly budget updated.", "success");
          }}
        >
          <input
            className="nx-input"
            type="number"
            min="0"
            step="0.01"
            value={totalInput}
            onChange={(event) => setTotalInput(event.target.value)}
            required
          />
          <button className="nx-btn primary" type="submit">
            Save
          </button>
        </form>
      </Modal>

      <Modal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Edit category allocations"
        description="Update category-level budget targets for this month."
        variant="fullscreen"
      >
        <form
          className="nx-form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await saveCategoryBudgets(
              allocation.categoryRows.map((row) => ({
                id: row.category.id,
                monthly_budget: Number(drafts[row.category.id] ?? row.allocated)
              }))
            );
            setShowCategoryModal(false);
            pushToast("Category budgets saved.", "success");
          }}
        >
          <div className="nx-form-grid">
            {allocation.categoryRows.map((row) => (
              <div key={row.category.id} className="nx-budget-editor-row">
                <span>{row.category.name}</span>
                <input
                  className="nx-input nx-budget-editor-input"
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
          <p className="nx-card-sub">
            Running total: {formatCRC(editorTotal)}
            {editorTotal > displayedTotal ? (
              <span style={{ color: "var(--red)", marginLeft: "8px" }}>exceeds monthly budget</span>
            ) : null}
          </p>
          <button className="nx-btn primary" type="submit">
            Save allocations
          </button>
        </form>
      </Modal>
    </div>
  );
}
