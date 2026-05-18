"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import { formatCRC } from "@/lib/format";
import type { SpendingCategory } from "@/lib/types";

const PRESET_COLORS = ["#2f8cdb", "#f09b3f", "#2bb78a", "#e0597d", "#9f85e5", "#76849f"];

type CategoryFormState = {
  name: string;
  budget: string;
  color: string;
};

const EMPTY_FORM: CategoryFormState = {
  name: "",
  budget: "",
  color: PRESET_COLORS[0]
};

export default function CategoriesPageClient({ userId }: { userId: string }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories(userId);
  const { expenses } = useExpenses(userId);
  const { pushToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CategoryFormState>(EMPTY_FORM);

  const [editingCategory, setEditingCategory] = useState<SpendingCategory | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormState>(EMPTY_FORM);

  const [deletingCategory, setDeletingCategory] = useState<SpendingCategory | null>(null);

  const monthId = new Date().toISOString().slice(0, 7);
  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const expense of expenses) {
      if (!expense.category_id || !expense.created_at.startsWith(monthId)) continue;
      map.set(expense.category_id, (map.get(expense.category_id) ?? 0) + Number(expense.amount));
    }
    return map;
  }, [expenses, monthId]);

  const openEdit = (category: SpendingCategory) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      budget: String(category.monthly_budget),
      color: category.color
    });
  };

  const onCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericBudget = Number(createForm.budget || "0");
    if (!createForm.name.trim()) {
      pushToast("Category name is required.", "error");
      return;
    }
    await addCategory({
      name: createForm.name.trim(),
      monthly_budget: Number.isFinite(numericBudget) ? numericBudget : 0,
      color: createForm.color
    });
    setCreateOpen(false);
    setCreateForm(EMPTY_FORM);
    pushToast("Category saved.", "success");
  };

  const onEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCategory) {
      return;
    }
    await updateCategory(editingCategory.id, {
      name: editForm.name.trim(),
      monthly_budget: Number(editForm.budget || "0"),
      color: editForm.color
    });
    setEditingCategory(null);
    pushToast("Category updated.", "success");
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "10px", gap: "8px", flexWrap: "wrap" }}>
          <h2 className="nx-card-title">Active categories</h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="nx-btn primary" type="button" onClick={() => setCreateOpen(true)}>
              Add category
            </button>
            <Link href="/dashboard/categories/rules" className="nx-btn">
              Manage rules
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          {categories.map((category) => {
            const spent = spentByCategory.get(category.id) ?? 0;
            const budgetAmount = Number(category.monthly_budget ?? 0);
            const pct = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 999) : 0;
            const isOver = budgetAmount > 0 && spent > budgetAmount;

            return (
              <article key={category.id} className="nx-panel" style={{ padding: "10px" }}>
                <div className="nx-between">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="nx-color-dot" style={{ background: category.color }} />
                    <strong>{category.name}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="nx-btn" type="button" onClick={() => openEdit(category)}>
                      Edit
                    </button>
                    <button className="nx-btn" type="button" onClick={() => setDeletingCategory(category)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <div className="nx-between">
                    <span>
                      {formatCRC(spent)} / {formatCRC(budgetAmount)}
                    </span>
                    {isOver ? <span style={{ color: "var(--red)", fontWeight: 700 }}>Over budget</span> : null}
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
              </article>
            );
          })}

          {!categories.length ? (
            <div className="nx-empty">No categories created yet. Add your first category to track spending accurately.</div>
          ) : null}
        </div>
      </section>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create category"
        description="Add a spending category with budget and color."
      >
        <CategoryForm
          value={createForm}
          onChange={setCreateForm}
          onSubmit={onCreateSubmit}
          submitLabel="Save category"
        />
      </Modal>

      <Modal
        open={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title={editingCategory ? `Edit ${editingCategory.name}` : "Edit category"}
        description="Update budget, naming, and visual color."
      >
        <CategoryForm
          value={editForm}
          onChange={setEditForm}
          onSubmit={onEditSubmit}
          submitLabel="Save changes"
        />
      </Modal>

      <Modal
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        title="Delete category"
        description="This removes the category configuration and associated rules."
      >
        <div className="nx-form-grid">
          <p className="nx-prose">
            Delete <strong>{deletingCategory?.name}</strong>?
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button className="nx-btn" type="button" onClick={() => setDeletingCategory(null)}>
              Cancel
            </button>
            <button
              className="nx-btn primary"
              type="button"
              onClick={async () => {
                if (!deletingCategory) {
                  return;
                }
                await deleteCategory(deletingCategory.id);
                setDeletingCategory(null);
                pushToast("Category deleted.", "success");
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CategoryForm({
  value,
  onChange,
  onSubmit,
  submitLabel
}: {
  value: CategoryFormState;
  onChange: (value: CategoryFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <form className="nx-form-grid" onSubmit={onSubmit}>
      <input
        className="nx-input"
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        placeholder="Category name"
        required
      />
      <input
        className="nx-input"
        type="number"
        min="0"
        step="0.01"
        value={value.budget}
        onChange={(event) => onChange({ ...value, budget: event.target.value })}
        placeholder="Monthly budget (CRC)"
      />
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {PRESET_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onChange({ ...value, color: swatch })}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              border: value.color === swatch ? "2px solid #fff" : "1px solid var(--border2)",
              background: swatch,
              transform: value.color === swatch ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.15s ease"
            }}
          />
        ))}
      </div>
      <input
        className="nx-input"
        value={value.color}
        onChange={(event) => onChange({ ...value, color: event.target.value })}
        placeholder="#2f8cdb"
      />
      <button className="nx-btn primary" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
