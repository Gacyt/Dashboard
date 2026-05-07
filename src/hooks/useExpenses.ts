"use client";

import { useEffect, useState } from "react";
import { Expense } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function useExpenses(userId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    supabase
      .from("expenses")
      .select("id, amount, category, description, expense_type, created_at")
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .lt("created_at", nextMonthStart)
      .order("created_at", { ascending: false })
      .then(({ data }) => setExpenses((data ?? []) as Expense[]));
  }, [supabase, userId]);

  const newExpenseCount = expenses.length;

  const addExpense = async (amount: number, description: string) => {
    const payload = {
      user_id: userId,
      amount,
      category: "other",
      description,
      expense_type: "normal" as const
    };
    const { data } = await supabase
      .from("expenses")
      .insert(payload)
      .select("id, amount, category, description, expense_type, created_at")
      .single();
    if (data) {
      setExpenses((prev) => [data as Expense, ...prev]);
    }
  };

  return { expenses, newExpenseCount, addExpense, setExpenses };
}
