"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Expense, MonthlyBudget, SpendingCategory } from "@/lib/types";

export function useMonthlyBudget(userId: string, month: string) {
  const supabase = getSupabaseBrowserClient();
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const queryData = useCallback(async () => {
    const [budgetResult, categoryResult, expenseResult] = await Promise.all([
      supabase
        .from("monthly_budgets")
        .select("id, user_id, month, total, created_at")
        .eq("user_id", userId)
        .eq("month", month)
        .maybeSingle(),
      supabase
        .from("spending_categories")
        .select("id, user_id, name, color, monthly_budget, created_at")
        .eq("user_id", userId)
        .order("name", { ascending: true }),
      supabase
        .from("expenses")
        .select("id, amount, category, category_id, description, expense_type, type, created_at")
        .eq("user_id", userId)
        .gte("created_at", `${month}-01T00:00:00.000Z`)
        .lt("created_at", `${nextMonth(month)}-01T00:00:00.000Z`)
    ]);

    if (budgetResult.error) throw budgetResult.error;
    if (categoryResult.error) throw categoryResult.error;
    if (expenseResult.error) throw expenseResult.error;

    return {
      budget: (budgetResult.data ?? null) as MonthlyBudget | null,
      categories: (categoryResult.data ?? []) as SpendingCategory[],
      expenses: (expenseResult.data ?? []) as Expense[]
    };
  }, [month, supabase, userId]);

  useEffect(() => {
    let active = true;

    void queryData().then((result) => {
      if (!active) return;
      setBudget(result.budget);
      setCategories(result.categories);
      setExpenses(result.expenses);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [queryData]);

  const updateTotalBudget = async (total: number) => {
    const { data, error } = await supabase
      .from("monthly_budgets")
      .upsert({ user_id: userId, month, total }, { onConflict: "user_id,month" })
      .select("id, user_id, month, total, created_at")
      .single();

    if (error) {
      throw error;
    }

    setBudget(data as MonthlyBudget);
  };

  const saveCategoryBudgets = async (values: Array<{ id: string; monthly_budget: number }>) => {
    const { error } = await supabase
      .from("spending_categories")
      .upsert(values);
    if (error) {
      throw error;
    }
    const result = await queryData();
    setBudget(result.budget);
    setCategories(result.categories);
    setExpenses(result.expenses);
  };

  const allocation = useMemo(() => {
    const total = Number(budget?.total ?? 0);
    const categoryRows = categories.map((category) => {
      const spent = expenses
        .filter((expense) => expense.category_id === category.id)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      const allocated = Number(category.monthly_budget ?? 0);
      const remaining = allocated - spent;
      const pct = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 999) : 0;
      return {
        category,
        spent,
        allocated,
        remaining,
        pct,
        isOver: spent > allocated
      };
    });

    const allocatedTotal = categoryRows.reduce((sum, row) => sum + row.allocated, 0);
    const unallocated = total - allocatedTotal;

    return { categoryRows, allocatedTotal, unallocated, total };
  }, [budget?.total, categories, expenses]);

  return {
    budget,
    categories,
    expenses,
    allocation,
    loading,
    updateTotalBudget,
    saveCategoryBudgets,
    refresh: async () => {
      const result = await queryData();
      setBudget(result.budget);
      setCategories(result.categories);
      setExpenses(result.expenses);
    }
  };
}

function nextMonth(month: string): string {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthNum = Number(monthText);
  if (monthNum === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${String(monthNum + 1).padStart(2, "0")}`;
}
