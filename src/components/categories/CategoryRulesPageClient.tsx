"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { useExpenseRules } from "@/hooks/useExpenseRules";
import { useToast } from "@/hooks/useToast";
import type { ExpenseRule } from "@/lib/types";

export default function CategoryRulesPageClient({ userId }: { userId: string }) {
  const { categories } = useCategories(userId);
  const { rules, addRule, deleteRule, reorderRules, setRules } = useExpenseRules(userId);
  const { pushToast } = useToast();

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [matchType, setMatchType] = useState<"contains" | "exact">("contains");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const orderedRules = useMemo(() => [...rules].sort((a, b) => b.priority - a.priority), [rules]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!keyword.trim() || !categoryId) {
      pushToast("Keyword and category are required.", "error");
      return;
    }

    await addRule({ keyword, category_id: categoryId, match_type: matchType });
    setKeyword("");
    setCategoryId("");
    setMatchType("contains");
    pushToast("Rule added.", "success");
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedRules.findIndex((rule) => rule.id === active.id);
    const newIndex = orderedRules.findIndex((rule) => rule.id === over.id);
    const next = arrayMove(orderedRules, oldIndex, newIndex);
    setRules(next);
    await reorderRules(next.map((rule) => rule.id));
    pushToast("Rule order updated.", "success");
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "10px" }}>
          <h2 className="nx-card-title">Expense Rules</h2>
          <Link href="/dashboard/categories" className="nx-btn">
            Back to Categories
          </Link>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={orderedRules.map((rule) => rule.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: "grid", gap: "8px" }}>
              {orderedRules.map((rule, index) => (
                <RuleItem
                  key={rule.id}
                  index={index}
                  rule={rule}
                  onDelete={async () => {
                    await deleteRule(rule.id);
                    pushToast("Rule deleted.", "success");
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <section className="nx-panel">
        <h2 className="nx-card-title" style={{ marginBottom: "10px" }}>Add Rule</h2>
        <form className="nx-form-grid two" onSubmit={onSubmit}>
          <input className="nx-input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Keyword" required />
          <select className="nx-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "8px" }}>
            <label>
              <input type="radio" checked={matchType === "contains"} onChange={() => setMatchType("contains")} />
              {" "}Contains
            </label>
            <label>
              <input type="radio" checked={matchType === "exact"} onChange={() => setMatchType("exact")} />
              {" "}Exact
            </label>
          </div>
          <button className="nx-btn primary" type="submit">
            Save Rule
          </button>
        </form>
      </section>
    </div>
  );
}

function RuleItem({
  rule,
  index,
  onDelete
}: {
  rule: ExpenseRule;
  index: number;
  onDelete: () => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rule.id });
  const category = Array.isArray(rule.spending_categories)
    ? rule.spending_categories[0]
    : rule.spending_categories;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="nx-panel nx-rule-row"
    >
      <div className="nx-between" style={{ gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="nx-btn" type="button" {...attributes} {...listeners} aria-label="Drag rule">
            ⋮⋮
          </button>
          <span style={{ minWidth: "24px", fontWeight: 700 }}>#{index + 1}</span>
          <span>{rule.keyword}</span>
          <span>→</span>
          <span style={{ color: category?.color ?? "var(--txt2)" }}>
            {category?.name ?? "No category"}
          </span>
          <span className="nx-badge" style={{ color: rule.match_type === "contains" ? "var(--accent)" : "var(--orange)" }}>
            {rule.match_type}
          </span>
        </div>
        <button
          className="nx-btn"
          type="button"
          onClick={() => {
            onDelete();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
