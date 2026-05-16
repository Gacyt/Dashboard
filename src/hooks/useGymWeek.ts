"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getWeekDates } from "@/lib/getWeekDates";
import type { GymDay } from "@/lib/types";

export function useGymWeek(userId: string, weekStart: Date) {
  const supabase = getSupabaseBrowserClient();
  const [days, setDays] = useState<GymDay[]>([]);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const startId = weekDates[0].toISOString().slice(0, 10);
  const endId = weekDates[6].toISOString().slice(0, 10);

  const queryDays = useCallback(async () => {
    const { data, error } = await supabase
      .from("gym_days")
      .select("id, user_id, date, type, label, muscles")
      .eq("user_id", userId)
      .gte("date", startId)
      .lte("date", endId)
      .order("date", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as GymDay[];
  }, [endId, startId, supabase, userId]);

  useEffect(() => {
    let active = true;
    void queryDays().then((rows) => {
      if (!active) return;
      setDays(rows);
    });

    return () => {
      active = false;
    };
  }, [queryDays]);

  const setDayType = async (
    date: string,
    nextType: "workout" | "rest",
    label?: string,
    muscles?: string[]
  ) => {
    const { error } = await supabase
      .from("gym_days")
      .upsert(
        {
          user_id: userId,
          date,
          type: nextType,
          label: label ?? null,
          muscles: muscles ?? []
        },
        { onConflict: "user_id,date" }
      );

    if (error) {
      throw error;
    }

    const rows = await queryDays();
    setDays(rows);
  };

  const refresh = async () => {
    const rows = await queryDays();
    setDays(rows);
  };

  return { days, weekDates, setDayType, refresh };
}
