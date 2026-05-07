import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type TaskPatchPayload = {
  title?: string;
  description?: string;
  status?: "Pending" | "Completed";
  due_date?: string | null;
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
  const payload = (await req.json()) as TaskPatchPayload;
  const updateData: Record<string, string | null> = {};

  if (typeof payload.title === "string") {
    updateData.title = payload.title.trim();
  }
  if (typeof payload.description === "string") {
    updateData.description = payload.description.trim();
  }
  if (payload.status === "Pending" || payload.status === "Completed") {
    updateData.status = payload.status;
  }
  if (payload.due_date !== undefined) {
    updateData.due_date = payload.due_date
      ? new Date(`${payload.due_date}T12:00:00.000Z`).toISOString()
      : null;
  }

  const { supabase } = auth;
  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .select("id, title, description, status, due_date, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
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
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
