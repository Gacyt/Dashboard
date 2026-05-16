"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { SpendingCategory } from "@/lib/types";

type CategoryPayload = {
  name: string;
  monthly_budget: number;
  color: string;
};

export function useCategories(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const queryCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("spending_categories")
      .select("id, user_id, name, color, monthly_budget, created_at")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as SpendingCategory[];
  }, [supabase, userId]);

  useEffect(() => {
    let active = true;

    void queryCategories().then((rows) => {
      if (!active) return;
      setCategories(rows);
      setLoading(false);
    });

    const channel = supabase
      .channel(`categories-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spending_categories", filter: `user_id=eq.${userId}` },
        () => {
          void queryCategories().then((rows) => {
            if (!active) return;
            setCategories(rows);
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [queryCategories, supabase, userId]);

  const addCategory = async (payload: CategoryPayload) => {
    const { data, error } = await supabase
      .from("spending_categories")
      .insert({ user_id: userId, ...payload })
      .select("id, user_id, name, color, monthly_budget, created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setCategories((prev) => [...prev, data as SpendingCategory]);
    }
  };

  const updateCategory = async (
    categoryId: string,
    payload: Partial<Pick<SpendingCategory, "name" | "color" | "monthly_budget">>
  ) => {
    const { data, error } = await supabase
      .from("spending_categories")
      .update(payload)
      .eq("id", categoryId)
      .eq("user_id", userId)
      .select("id, user_id, name, color, monthly_budget, created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setCategories((prev) => prev.map((item) => (item.id === categoryId ? (data as SpendingCategory) : item)));
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const { error } = await supabase
      .from("spending_categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    setCategories((prev) => prev.filter((item) => item.id !== categoryId));
  };

  return { categories, addCategory, updateCategory, deleteCategory, loading };
}
