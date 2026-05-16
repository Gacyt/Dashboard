"use client";

import { useEffect, useState } from "react";
import { Expense } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { NX_CREATE_HUB_CREATED_EVENT } from "@/lib/createHub";

type CreateExpensePayload = {
  amount: number;
  description: string;
  category?: string;
  categoryId?: string | null;
  expenseType?: "normal" | "extraordinary";
  date?: string;
};

export function useExpenses(userId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const refresh = () => {
      supabase
        .from("expenses")
        .select("id, amount, category, category_id, description, expense_type, type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .then(({ data }) => setExpenses((data ?? []) as Expense[]));
    };

    const onCreated = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string }>).detail;
      if (detail?.kind === "expense") {
        refresh();
      }
    };

    refresh();
    window.addEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);

    return () => {
      window.removeEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);
    };
  }, [supabase, userId]);

  const newExpenseCount = expenses.length;

  const addExpense = async (
    amount: number,
    description: string,
    options?: { category?: string; categoryId?: string | null; expenseType?: "normal" | "extraordinary"; date?: string }
  ) => {
    const createdAt = options?.date
      ? new Date(`${options.date}T12:00:00.000Z`).toISOString()
      : new Date().toISOString();
    const payload = {
      user_id: userId,
      amount,
      category: options?.category ?? "other",
      category_id: options?.categoryId ?? null,
      description,
      expense_type: options?.expenseType ?? "normal",
      type: "expense" as const,
      created_at: createdAt
    };
    const { data } = await supabase
      .from("expenses")
      .insert(payload)
      .select("id, amount, category, category_id, description, expense_type, type, created_at")
      .single();
    if (data) {
      setExpenses((prev) => [data as Expense, ...prev]);
    }
  };

  const createExpense = async (payload: CreateExpensePayload) => {
    await addExpense(payload.amount, payload.description, {
      category: payload.category,
      categoryId: payload.categoryId,
      expenseType: payload.expenseType,
      date: payload.date
    });
  };

  const updateExpense = async (
    expenseId: string,
    payload: Partial<Pick<Expense, "amount" | "category" | "category_id" | "description" | "expense_type" | "created_at">>
  ) => {
    const { data } = await supabase
      .from("expenses")
      .update(payload)
      .eq("id", expenseId)
      .select("id, amount, category, category_id, description, expense_type, type, created_at")
      .single();
    if (data) {
      setExpenses((prev) =>
        prev.map((item) => (item.id === expenseId ? (data as Expense) : item))
      );
    }
  };

  const deleteExpense = async (expenseId: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
    if (!error) {
      setExpenses((prev) => prev.filter((item) => item.id !== expenseId));
    }
  };

  return { expenses, newExpenseCount, addExpense, createExpense, updateExpense, deleteExpense, setExpenses };
}
