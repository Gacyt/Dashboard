import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type HabitPayload = {
  name: string;
  target_per_day: number;
};

export async function POST(req: Request) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await req.json()) as HabitPayload;
  if (!payload.name?.trim()) {
    return NextResponse.json({ error: "Habit name is required" }, { status: 400 });
  }

  const target = Math.max(1, Number(payload.target_per_day ?? 1));
  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name: payload.name.trim(),
      target_per_day: target
    })
    .select("id, name, target_per_day, created_at, habit_logs(id, date, completed)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ habit: data });
}
