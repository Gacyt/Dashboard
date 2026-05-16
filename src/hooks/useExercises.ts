"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Exercise, ExerciseSetRow } from "@/lib/types";

type NewSet = { weight_kg?: number; reps?: number; notes?: string };

export function useExercises(userId: string, gymDayId: string | null) {
  const supabase = getSupabaseBrowserClient();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const queryExercises = useCallback(async () => {
    if (!gymDayId) {
      return [] as Exercise[];
    }

    const { data, error } = await supabase
      .from("exercises")
      .select(`
        id,
        gym_day_id,
        user_id,
        name,
        notes,
        photo_url,
        order_index,
        created_at,
        exercise_sets(id, exercise_id, set_number, weight_kg, reps, notes)
      `)
      .eq("user_id", userId)
      .eq("gym_day_id", gymDayId)
      .order("order_index", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as Exercise[]).map((exercise) => ({
      ...exercise,
      exercise_sets: [...(exercise.exercise_sets ?? [])].sort((a, b) => a.set_number - b.set_number)
    }));
  }, [gymDayId, supabase, userId]);

  useEffect(() => {
    let active = true;
    void queryExercises().then((rows) => {
      if (!active) return;
      setExercises(rows);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [queryExercises]);

  const addExercise = async (name: string, notes: string, sets: NewSet[]) => {
    if (!gymDayId) {
      throw new Error("Select a gym day first.");
    }

    const nextIndex = exercises.length;
    const { data: exercise, error } = await supabase
      .from("exercises")
      .insert({
        user_id: userId,
        gym_day_id: gymDayId,
        name: name.trim(),
        notes: notes.trim() || null,
        order_index: nextIndex
      })
      .select("id, gym_day_id, user_id, name, notes, photo_url, order_index, created_at")
      .single();

    if (error) {
      throw error;
    }

    if (sets.length > 0) {
      const { error: setError } = await supabase
        .from("exercise_sets")
        .insert(
          sets.map((set, index) => ({
            exercise_id: exercise.id,
            set_number: index + 1,
            weight_kg: set.weight_kg ?? null,
            reps: set.reps ?? null,
            notes: set.notes ?? null
          }))
        );

      if (setError) {
        throw setError;
      }
    }

    const rows = await queryExercises();
    setExercises(rows);
  };

  const updateExercise = async (
    exerciseId: string,
    payload: Partial<Pick<Exercise, "name" | "notes" | "photo_url">>
  ) => {
    const { error } = await supabase
      .from("exercises")
      .update(payload)
      .eq("id", exerciseId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const rows = await queryExercises();
    setExercises(rows);
  };

  const deleteExercise = async (exerciseId: string) => {
    const { error } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exerciseId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const rows = await queryExercises();
    setExercises(rows);
  };

  const reorderExercises = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({ id, order_index: index }));
    const { error } = await supabase.from("exercises").upsert(updates);
    if (error) {
      throw error;
    }
    const rows = await queryExercises();
    setExercises(rows);
  };

  const saveSet = async (
    exerciseId: string,
    set: Partial<ExerciseSetRow> & { id?: string; set_number: number }
  ) => {
    const payload = {
      id: set.id,
      exercise_id: exerciseId,
      set_number: set.set_number,
      weight_kg: set.weight_kg ?? null,
      reps: set.reps ?? null,
      notes: set.notes ?? null
    };

    const { error } = await supabase
      .from("exercise_sets")
      .upsert(payload);

    if (error) {
      throw error;
    }

    const rows = await queryExercises();
    setExercises(rows);
  };

  const deleteSet = async (setId: string) => {
    const { error } = await supabase
      .from("exercise_sets")
      .delete()
      .eq("id", setId);

    if (error) {
      throw error;
    }

    const rows = await queryExercises();
    setExercises(rows);
  };

  const uploadPhoto = async (
    exerciseId: string,
    file: File,
    onProgress?: (value: number) => void
  ) => {
    onProgress?.(20);
    const uploadPath = `${userId}/${exerciseId}/${file.name}`;
    const { error } = await supabase.storage
      .from("exercise-photos")
      .upload(uploadPath, file, { upsert: true });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("exercise-photos")
      .getPublicUrl(uploadPath);

    onProgress?.(100);
    await updateExercise(exerciseId, { photo_url: data.publicUrl });
  };

  const refresh = async () => {
    const rows = await queryExercises();
    setExercises(rows);
  };

  return {
    exercises,
    setExercises,
    loading,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    saveSet,
    deleteSet,
    uploadPhoto,
    refresh
  };
}
