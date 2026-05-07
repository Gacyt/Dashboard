import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type HabitLogPayload = {
  date?: string;
  completed?: boolean;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await params;
  const payload = (await req.json()) as HabitLogPayload;
  const date = payload.date ?? new Date().toISOString().slice(0, 10);
  const completed = payload.completed ?? true;

  const { supabase } = auth;
  const { error } = await supabase.from("habit_logs").upsert(
    {
      habit_id: id,
      date,
      completed
    },
    { onConflict: "habit_id,date" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id, name, target_per_day, created_at, habit_logs(id, date, completed)")
    .eq("id", id)
    .single();

  if (habitError) {
    return NextResponse.json({ error: habitError.message }, { status: 500 });
  }

  return NextResponse.json({ habit });
}
