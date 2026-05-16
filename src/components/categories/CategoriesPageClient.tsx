"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import { formatCRC } from "@/lib/format";

const PRESET_COLORS = ["#00D4FF", "#FF6B2B", "#00C896", "#FF3D5A", "#F0B429", "#A78BFA"];

export default function CategoriesPageClient({ userId }: { userId: string }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories(userId);
  const { expenses } = useExpenses(userId);
  const { pushToast } = useToast();

  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingBudget, setEditingBudget] = useState("");
  const [editingColor, setEditingColor] = useState(PRESET_COLORS[0]);

  const monthId = new Date().toISOString().slice(0, 7);
  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const expense of expenses) {
      if (!expense.category_id || !expense.created_at.startsWith(monthId)) continue;
      map.set(expense.category_id, (map.get(expense.category_id) ?? 0) + Number(expense.amount));
    }
    return map;
  }, [expenses, monthId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericBudget = Number(budget || "0");
    if (!name.trim()) {
      pushToast("Category name is required.", "error");
      return;
    }
    await addCategory({
      name: name.trim(),
      monthly_budget: Number.isFinite(numericBudget) ? numericBudget : 0,
      color
    });
    setName("");
    setBudget("");
    setColor(PRESET_COLORS[0]);
    pushToast("Category saved.", "success");
  };

  const beginEdit = (category: { id: string; name: string; monthly_budget: number; color: string }) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingBudget(String(category.monthly_budget));
    setEditingColor(category.color);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateCategory(editingId, {
      name: editingName.trim(),
      monthly_budget: Number(editingBudget || "0"),
      color: editingColor
    });
    setEditingId(null);
    pushToast("Category updated.", "success");
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "10px" }}>
          <h2 className="nx-card-title">Active Categories</h2>
          <Link href="/dashboard/categories/rules" className="nx-btn">
            Manage Rules
          </Link>
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          {categories.map((category) => {
            const spent = spentByCategory.get(category.id) ?? 0;
            const budgetAmount = Number(category.monthly_budget ?? 0);
            const pct = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 999) : 0;
            const isOver = budgetAmount > 0 && spent > budgetAmount;
            const editing = editingId === category.id;

            return (
              <div key={category.id} className="nx-panel" style={{ padding: "10px" }}>
                <div className="nx-between">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="nx-color-dot" style={{ background: category.color }} />
                    <strong>{category.name}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="nx-btn" type="button" onClick={() => beginEdit(category)}>
                      Edit
                    </button>
                    <button
                      className="nx-btn"
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Delete category "${category.name}"?`)) return;
                        await deleteCategory(category.id);
                        pushToast("Category deleted.", "success");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <div className="nx-between">
                    <span>{formatCRC(spent)} / {formatCRC(budgetAmount)}</span>
                    {isOver ? <span style={{ color: "var(--red)", fontWeight: 700 }}>OVER BUDGET</span> : null}
                  </div>
                  <div className="nx-progress" style={{ marginTop: "5px" }}>
                    <span
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: isOver ? "var(--red)" : category.color
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: editing ? "180px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.2s ease",
                    marginTop: editing ? "10px" : "0"
                  }}
                >
                  {editing ? (
                    <div className="nx-form-grid two">
                      <input className="nx-input" value={editingName} onChange={(event) => setEditingName(event.target.value)} placeholder="Name" />
                      <input className="nx-input" type="number" min="0" step="0.01" value={editingBudget} onChange={(event) => setEditingBudget(event.target.value)} placeholder="Monthly budget" />
                      <input className="nx-input" value={editingColor} onChange={(event) => setEditingColor(event.target.value)} placeholder="#00D4FF" />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="nx-btn primary" type="button" onClick={saveEdit}>Save</button>
                        <button className="nx-btn" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="nx-panel">
        <h2 className="nx-card-title" style={{ marginBottom: "10px" }}>Add / Edit Category</h2>
        <form className="nx-form-grid two" onSubmit={onSubmit}>
          <input className="nx-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" required />
          <input className="nx-input" type="number" min="0" step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Monthly budget (CRC)" />
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {PRESET_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  border: color === swatch ? "2px solid #fff" : "1px solid var(--border2)",
                  background: swatch,
                  transform: color === swatch ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.15s ease"
                }}
              />
            ))}
          </div>
          <input className="nx-input" value={color} onChange={(event) => setColor(event.target.value)} placeholder="#00D4FF" />
          <button className="nx-btn primary" type="submit">
            Save Category
          </button>
        </form>
      </section>
    </div>
  );
}
