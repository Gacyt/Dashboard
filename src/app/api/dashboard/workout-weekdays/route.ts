import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type WeekdayPayload = {
  weekday: number;
  title: string;
  notes?: string;
};

function normalizeWeekday(value: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 7) {
    return null;
  }
  return parsed;
}

export async function GET() {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const { supabase, user } = auth;
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
    .eq("user_id", user.id)
    .order("weekday", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ weekdays: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await req.json()) as WeekdayPayload;
  const weekday = normalizeWeekday(payload.weekday);
  if (!weekday) {
    return NextResponse.json({ error: "Weekday must be between 1 and 7." }, { status: 400 });
  }
  if (!payload.title?.trim()) {
    return NextResponse.json({ error: "Workout title is required." }, { status: 400 });
  }

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("workout_weekdays")
    .upsert(
      {
        user_id: user.id,
        weekday,
        title: payload.title.trim(),
        notes: payload.notes?.trim() || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,weekday" }
    )
    .select("id, user_id, weekday, title, notes, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ weekday: data });
}
