"use client";

import { FormEvent, useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useDeposits } from "@/hooks/useDeposits";
import { useToast } from "@/hooks/useToast";
import { formatCRC } from "@/lib/format";
import Modal from "@/components/ui/Modal";
import { openCreateHub } from "@/lib/createHub";

export default function FinancePageClient({ userId }: { userId: string }) {
  const { expenses } = useExpenses(userId);
  const { categories } = useCategories(userId);
  const { deposits, addDeposit, monthlyTotal } = useDeposits(userId);
  const { pushToast } = useToast();

  const [depositAmount, setDepositAmount] = useState("");
  const [depositSource, setDepositSource] = useState("");
  const [depositType, setDepositType] = useState<"salary" | "freelance" | "transfer" | "refund" | "other">("salary");
  const [depositDate, setDepositDate] = useState(new Date().toISOString().slice(0, 10));
  const [showDepositModal, setShowDepositModal] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const monthId = new Date().toISOString().slice(0, 7);
  const totalSpent = useMemo(
    () =>
      expenses
        .filter((expense) => expense.created_at.slice(0, 7) === monthId)
        .reduce((sum, expense) => sum + Number(expense.amount), 0),
    [expenses, monthId]
  );

  const net = monthlyTotal - totalSpent;

  const overBudgetCategories = useMemo(() => {
    return categories
      .map((category) => {
        const spent = expenses
          .filter((expense) => expense.category_id === category.id && expense.created_at.startsWith(monthId))
          .reduce((sum, expense) => sum + Number(expense.amount), 0);
        return { category, spent };
      })
      .filter((item) => Number(item.category.monthly_budget) > 0 && item.spent > Number(item.category.monthly_budget));
  }, [categories, expenses, monthId]);

  const onDepositSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(depositAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      pushToast("Deposit amount must be greater than zero.", "error");
      return;
    }

    await addDeposit({
      amount: parsedAmount,
      source: depositSource,
      type: depositType,
      date: depositDate
    });

    setDepositAmount("");
    setDepositSource("");
    setDepositType("salary");
    setDepositDate(new Date().toISOString().slice(0, 10));
    setShowDepositModal(false);
    pushToast("Deposit saved.", "success");
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
          <div>
            <h2 className="nx-card-title">Finance Flow</h2>
            <p className="nx-card-sub">Capture money movement in focused dialogs.</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="nx-btn primary" type="button" onClick={() => openCreateHub("expense")}>
              Add Expense
            </button>
            <button className="nx-btn" type="button" onClick={() => setShowDepositModal(true)}>
              Add Deposit
            </button>
          </div>
        </div>

        <div className="nx-fin-grid">
          <div className="nx-fin-box">
            <p className="nx-fin-label">Total Spent (Month)</p>
            <p className="nx-fin-val spent">{formatCRC(totalSpent)}</p>
          </div>
          <div className="nx-fin-box">
            <p className="nx-fin-label">Total Deposits (Month)</p>
            <p className="nx-fin-val remain">{formatCRC(monthlyTotal)}</p>
          </div>
          <div className="nx-fin-box full">
            <p className="nx-fin-label">Net Balance</p>
            <p className="nx-fin-val" style={{ color: net >= 0 ? "var(--green)" : "var(--red)" }}>
              {formatCRC(net)}
            </p>
          </div>
        </div>

        {overBudgetCategories.length > 0 ? (
          <div className="nx-panel" style={{ borderLeft: "2px solid var(--red)", marginTop: "10px" }}>
            {overBudgetCategories.length} category over budget:{" "}
            {overBudgetCategories.map((item) => item.category.name).join(", ")}
          </div>
        ) : null}
      </section>

      <section className="nx-panel">
        <div className="nx-between" style={{ marginBottom: "10px", gap: "8px" }}>
          <h2 className="nx-card-title">Income / Deposits</h2>
          <button className="nx-btn" type="button" onClick={() => setShowDepositModal(true)}>
            Add Deposit
          </button>
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          {deposits.map((deposit) => (
            <div key={deposit.id} className="nx-exp-row">
              <div className="nx-exp-ic" style={{ color: "var(--green)", background: "var(--green-dim)" }}>
                ↙
              </div>
              <div className="nx-flex-1">
                <p className="nx-exp-name">{deposit.source || "Deposit"}</p>
                <p className="nx-exp-cat">
                  <span className="nx-badge">{deposit.type}</span> · {new Date(deposit.date).toLocaleDateString()}
                </p>
              </div>
              <p className="nx-exp-amt" style={{ color: "var(--green)" }}>
                +{formatCRC(Number(deposit.amount))}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="nx-panel">
        <div className="nx-between" style={{ marginBottom: "10px", gap: "8px" }}>
          <h2 className="nx-card-title">Recent Expenses</h2>
          <button className="nx-btn" type="button" onClick={() => openCreateHub("expense")}>
            New Expense
          </button>
        </div>
        <div style={{ display: "grid", gap: "8px" }}>
          {expenses.map((expense) => {
            const category = expense.category_id ? categoryMap.get(expense.category_id) : null;
            return (
              <div key={expense.id} className="nx-exp-row">
                <div className="nx-color-dot" style={{ background: category?.color ?? "var(--orange)" }} />
                <div className="nx-flex-1">
                  <p className="nx-exp-name">{expense.description || "Expense"}</p>
                  <p className="nx-exp-cat">
                    {category?.name ?? expense.category ?? "Unclassified"} ·{" "}
                    {new Date(expense.created_at).toLocaleDateString()}
                    {!expense.category_id ? <span className="nx-badge orange" style={{ marginLeft: "8px" }}>Unclassified</span> : null}
                  </p>
                </div>
                <p className="nx-exp-amt">-{formatCRC(Number(expense.amount))}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Modal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Add Deposit"
        description="Capture incoming money with type and source."
      >
        <form className="nx-form-grid" onSubmit={onDepositSubmit}>
          <input
            className="nx-input"
            type="number"
            min="0.01"
            step="0.01"
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
            placeholder="Amount"
            required
            aria-label="Deposit amount"
          />
          <input
            className="nx-input"
            type="text"
            value={depositSource}
            onChange={(event) => setDepositSource(event.target.value)}
            placeholder="Source"
            aria-label="Deposit source"
          />
          <select
            className="nx-select"
            value={depositType}
            onChange={(event) =>
              setDepositType(event.target.value as "salary" | "freelance" | "transfer" | "refund" | "other")
            }
            aria-label="Deposit type"
          >
            <option value="salary">salary</option>
            <option value="freelance">freelance</option>
            <option value="transfer">transfer</option>
            <option value="refund">refund</option>
            <option value="other">other</option>
          </select>
          <input
            className="nx-input"
            type="date"
            value={depositDate}
            onChange={(event) => setDepositDate(event.target.value)}
            required
            aria-label="Deposit date"
          />
          <button className="nx-btn primary" type="submit">
            Save Deposit
          </button>
        </form>
      </Modal>
    </div>
  );
}
