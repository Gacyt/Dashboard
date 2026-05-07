import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type JournalPatchPayload = {
  title?: string;
  content?: string;
  mood?: "Great" | "Good" | "Neutral" | "Bad";
};

const validMoods = new Set(["Great", "Good", "Neutral", "Bad"]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await params;
  const payload = (await req.json()) as JournalPatchPayload;
  const updateData: Record<string, string> = {};

  if (typeof payload.title === "string") {
    updateData.title = payload.title.trim();
  }
  if (typeof payload.content === "string") {
    updateData.content = payload.content.trim();
  }
  if (payload.mood) {
    if (!validMoods.has(payload.mood)) {
      return NextResponse.json({ error: "Invalid mood" }, { status: 400 });
    }
    updateData.mood = payload.mood;
  }

  const { supabase } = auth;
  const { data, error } = await supabase
    .from("journal_entries")
    .update(updateData)
    .eq("id", id)
    .select("id, title, content, mood, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
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
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
