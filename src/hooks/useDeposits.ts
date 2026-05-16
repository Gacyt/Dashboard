"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Deposit } from "@/lib/types";

type DepositPayload = {
  amount: number;
  source?: string;
  type: Deposit["type"];
  date: string;
};

export function useDeposits(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    supabase
      .from("deposits")
      .select("id, user_id, amount, source, type, date, created_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .then(({ data }) => setDeposits((data ?? []) as Deposit[]));
  }, [supabase, userId]);

  const addDeposit = async (payload: DepositPayload) => {
    const { data, error } = await supabase
      .from("deposits")
      .insert({
        user_id: userId,
        amount: payload.amount,
        source: payload.source?.trim() || null,
        type: payload.type,
        date: payload.date
      })
      .select("id, user_id, amount, source, type, date, created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setDeposits((prev) => [data as Deposit, ...prev]);
    }
  };

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return deposits
      .filter((deposit) => deposit.date.startsWith(monthId))
      .reduce((sum, deposit) => sum + Number(deposit.amount), 0);
  }, [deposits]);

  return { deposits, addDeposit, monthlyTotal };
}
