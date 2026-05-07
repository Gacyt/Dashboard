import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type TaskPayload = {
  title: string;
  description?: string;
  due_date?: string | null;
};

export async function POST(req: Request) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await req.json()) as TaskPayload;
  if (!payload.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: payload.title.trim(),
      description: payload.description?.trim() ?? "",
      status: "Pending",
      due_date: payload.due_date ? new Date(`${payload.due_date}T12:00:00.000Z`) : null
    })
    .select("id, title, description, status, due_date, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}
