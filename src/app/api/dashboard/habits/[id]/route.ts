import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type HabitPatchPayload = {
  name?: string;
  target_per_day?: number;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await params;
  const payload = (await req.json()) as HabitPatchPayload;
  const updateData: Record<string, string | number> = {};

  if (typeof payload.name === "string") {
    updateData.name = payload.name.trim();
  }
  if (payload.target_per_day !== undefined) {
    updateData.target_per_day = Math.max(1, Number(payload.target_per_day));
  }

  const { supabase } = auth;
  const { data, error } = await supabase
    .from("habits")
    .update(updateData)
    .eq("id", id)
    .select("id, name, target_per_day, created_at, habit_logs(id, date, completed)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ habit: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await params;
  const { supabase } = auth;
  const { error } = await supabase.from("habits").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
