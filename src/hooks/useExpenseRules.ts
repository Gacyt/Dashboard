"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { ExpenseRule } from "@/lib/types";

type RulePayload = {
  keyword: string;
  category_id: string;
  match_type: "contains" | "exact";
};

export function useExpenseRules(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const [rules, setRules] = useState<ExpenseRule[]>([]);
  const [loading, setLoading] = useState(true);

  const queryRules = useCallback(async () => {
    const { data, error } = await supabase
      .from("expense_rules")
      .select(`
        id,
        user_id,
        keyword,
        match_type,
        category_id,
        priority,
        created_at,
        spending_categories(id, name, color)
      `)
      .eq("user_id", userId)
      .order("priority", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as ExpenseRule[];
  }, [supabase, userId]);

  useEffect(() => {
    let active = true;
    void queryRules().then((rows) => {
      if (!active) return;
      setRules(rows);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [queryRules]);

  const addRule = async (payload: RulePayload) => {
    const maxPriority = rules[0]?.priority ?? 0;
    const { data, error } = await supabase
      .from("expense_rules")
      .insert({
        user_id: userId,
        keyword: payload.keyword.trim(),
        category_id: payload.category_id,
        match_type: payload.match_type,
        priority: maxPriority + 1
      })
      .select(`
        id,
        user_id,
        keyword,
        match_type,
        category_id,
        priority,
        created_at,
        spending_categories(id, name, color)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setRules((prev) => [data as ExpenseRule, ...prev]);
    }
  };

  const updateRule = async (
    ruleId: string,
    payload: Partial<Pick<ExpenseRule, "keyword" | "match_type" | "category_id">>
  ) => {
    const { data, error } = await supabase
      .from("expense_rules")
      .update(payload)
      .eq("id", ruleId)
      .eq("user_id", userId)
      .select(`
        id,
        user_id,
        keyword,
        match_type,
        category_id,
        priority,
        created_at,
        spending_categories(id, name, color)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setRules((prev) => prev.map((item) => (item.id === ruleId ? (data as ExpenseRule) : item)));
    }
  };

  const deleteRule = async (ruleId: string) => {
    const { error } = await supabase
      .from("expense_rules")
      .delete()
      .eq("id", ruleId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    setRules((prev) => prev.filter((item) => item.id !== ruleId));
  };

  const reorderRules = async (orderedRuleIds: string[]) => {
    const updates = orderedRuleIds.map((id, index) => ({
      id,
      priority: orderedRuleIds.length - index
    }));

    const { error } = await supabase
      .from("expense_rules")
      .upsert(updates);

    if (error) {
      throw error;
    }

    const rows = await queryRules();
    setRules(rows);
  };

  return { rules, loading, addRule, updateRule, deleteRule, reorderRules, setRules };
}
