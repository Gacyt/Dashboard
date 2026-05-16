"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { WorkoutProgressLog, WorkoutWeekday } from "@/lib/types";
import { NX_CREATE_HUB_CREATED_EVENT } from "@/lib/createHub";

type SaveWeekdayPayload = {
  weekday: number;
  title: string;
  notes?: string;
};

type AddExercisePayload = {
  weekday: number;
  name: string;
  notes?: string;
  target_sets?: number;
  target_reps?: number;
};

type SaveProgressPayload = {
  exerciseId: string;
  performedOn: string;
  completed: boolean;
  weightKg?: number | null;
  reps?: number | null;
  notes?: string;
};

export function useWorkoutWeekdays(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const [weekdays, setWeekdays] = useState<WorkoutWeekday[]>([]);
  const [logs, setLogs] = useState<WorkoutProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  const queryWeekdays = useCallback(async () => {
    const { data, error } = await supabase
      .from("workout_weekdays")
      .select(`
        id,
        user_id,
        weekday,
        title,
        notes,
        created_at,
        updated_at,
        workout_weekday_exercises(
          id,
          workout_weekday_id,
          name,
          notes,
          target_sets,
          target_reps,
          order_index,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("weekday", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as WorkoutWeekday[]).map((row) => ({
      ...row,
      workout_weekday_exercises: [...(row.workout_weekday_exercises ?? [])].sort(
        (a, b) => a.order_index - b.order_index
      )
    }));
  }, [supabase, userId]);

  const queryLogs = useCallback(async () => {
    const since = new Date();
    since.setDate(since.getDate() - 42);

    const { data, error } = await supabase
      .from("workout_progress_logs")
      .select(`
        id,
        workout_weekday_exercise_id,
        user_id,
        performed_on,
        weight_kg,
        reps,
        completed,
        notes,
        created_at
      `)
      .eq("user_id", userId)
      .gte("performed_on", since.toISOString().slice(0, 10))
      .order("performed_on", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as WorkoutProgressLog[];
  }, [supabase, userId]);

  const refresh = useCallback(async () => {
    const [weekdayRows, logRows] = await Promise.all([queryWeekdays(), queryLogs()]);
    setWeekdays(weekdayRows);
    setLogs(logRows);
    setLoading(false);
  }, [queryLogs, queryWeekdays]);

  useEffect(() => {
    let active = true;
    void Promise.all([queryWeekdays(), queryLogs()]).then(([weekdayRows, logRows]) => {
      if (!active) {
        return;
      }
      setWeekdays(weekdayRows);
      setLogs(logRows);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [queryLogs, queryWeekdays]);

  useEffect(() => {
    const onCreated = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string }>).detail;
      if (detail?.kind === "workout-day" || detail?.kind === "exercise") {
        void refresh();
      }
    };

    window.addEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);
    return () => {
      window.removeEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);
    };
  }, [refresh]);

  const saveWeekday = async (payload: SaveWeekdayPayload) => {
    const weekday = Number(payload.weekday);
    const { error } = await supabase
      .from("workout_weekdays")
      .upsert(
        {
          user_id: userId,
          weekday,
          title: payload.title.trim(),
          notes: payload.notes?.trim() || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,weekday" }
      );

    if (error) {
      throw error;
    }

    await refresh();
  };

  const addExercise = async (payload: AddExercisePayload) => {
    const weekday = Number(payload.weekday);
    const { data: weekdayRow, error: weekdayError } = await supabase
      .from("workout_weekdays")
      .upsert(
        {
          user_id: userId,
          weekday,
          title: "Workout",
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,weekday" }
      )
      .select("id")
      .single();

    if (weekdayError) {
      throw weekdayError;
    }

    const { data: last } = await supabase
      .from("workout_weekday_exercises")
      .select("order_index")
      .eq("workout_weekday_id", weekdayRow.id)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase
      .from("workout_weekday_exercises")
      .insert({
        workout_weekday_id: weekdayRow.id,
        name: payload.name.trim(),
        notes: payload.notes?.trim() || null,
        target_sets: Math.max(1, Number(payload.target_sets ?? 4)),
        target_reps: Math.max(1, Number(payload.target_reps ?? 8)),
        order_index: Number(last?.order_index ?? -1) + 1
      });

    if (error) {
      throw error;
    }

    await refresh();
  };

  const updateExercise = async (
    exerciseId: string,
    payload: Partial<{ name: string; notes: string | null; target_sets: number; target_reps: number }>
  ) => {
    const { error } = await supabase
      .from("workout_weekday_exercises")
      .update(payload)
      .eq("id", exerciseId);

    if (error) {
      throw error;
    }

    await refresh();
  };

  const deleteExercise = async (exerciseId: string) => {
    const { error } = await supabase
      .from("workout_weekday_exercises")
      .delete()
      .eq("id", exerciseId);

    if (error) {
      throw error;
    }

    await refresh();
  };

  const reorderExercises = async (
    updates: Array<{ id: string; order_index: number }>
  ) => {
    const { error } = await supabase
      .from("workout_weekday_exercises")
      .upsert(updates);

    if (error) {
      throw error;
    }

    await refresh();
  };

  const saveProgress = async (payload: SaveProgressPayload) => {
    const { error } = await supabase
      .from("workout_progress_logs")
      .upsert(
        {
          workout_weekday_exercise_id: payload.exerciseId,
          user_id: userId,
          performed_on: payload.performedOn,
          completed: payload.completed,
          weight_kg: payload.weightKg ?? null,
          reps: payload.reps ?? null,
          notes: payload.notes?.trim() || null
        },
        { onConflict: "workout_weekday_exercise_id,performed_on" }
      );

    if (error) {
      throw error;
    }

    await refresh();
  };

  const progressByExercise = useMemo(() => {
    const map = new Map<string, WorkoutProgressLog[]>();
    for (const log of logs) {
      const list = map.get(log.workout_weekday_exercise_id) ?? [];
      list.push(log);
      map.set(log.workout_weekday_exercise_id, list);
    }
    return map;
  }, [logs]);

  return {
    weekdays,
    logs,
    progressByExercise,
    loading,
    saveWeekday,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    saveProgress,
    refresh
  };
}
