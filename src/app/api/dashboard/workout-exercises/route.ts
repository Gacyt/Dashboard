import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type ExercisePayload = {
  weekday: number;
  name: string;
  notes?: string;
  target_sets?: number;
  target_reps?: number;
};

function normalizeWeekday(value: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 7) {
    return null;
  }
  return parsed;
}

export async function POST(req: Request) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await req.json()) as ExercisePayload;
  const weekday = normalizeWeekday(payload.weekday);
  if (!weekday) {
    return NextResponse.json({ error: "Weekday must be between 1 and 7." }, { status: 400 });
  }
  if (!payload.name?.trim()) {
    return NextResponse.json({ error: "Exercise name is required." }, { status: 400 });
  }

  const { supabase, user } = auth;

  const { data: weekdayData, error: weekdayError } = await supabase
    .from("workout_weekdays")
    .upsert(
      {
        user_id: user.id,
        weekday,
        title: "Workout",
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,weekday" }
    )
    .select("id")
    .single();

  if (weekdayError) {
    return NextResponse.json({ error: weekdayError.message }, { status: 500 });
  }

  const { data: lastExercise } = await supabase
    .from("workout_weekday_exercises")
    .select("order_index")
    .eq("workout_weekday_id", weekdayData.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = Number(lastExercise?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from("workout_weekday_exercises")
    .insert({
      workout_weekday_id: weekdayData.id,
      name: payload.name.trim(),
      notes: payload.notes?.trim() || null,
      target_sets: Math.max(1, Number(payload.target_sets ?? 4)),
      target_reps: Math.max(1, Number(payload.target_reps ?? 8)),
      order_index: nextOrder
    })
    .select(`
      id,
      workout_weekday_id,
      name,
      notes,
      target_sets,
      target_reps,
      order_index,
      created_at
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ exercise: data });
}
