import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type JournalPayload = {
  title: string;
  content: string;
  mood: "Great" | "Good" | "Neutral" | "Bad";
};

const validMoods = new Set(["Great", "Good", "Neutral", "Bad"]);

export async function POST(req: Request) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await req.json()) as JournalPayload;
  if (!payload.title?.trim() || !payload.content?.trim()) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }
  if (!validMoods.has(payload.mood)) {
    return NextResponse.json({ error: "Invalid mood" }, { status: 400 });
  }

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      title: payload.title.trim(),
      content: payload.content.trim(),
      mood: payload.mood
    })
    .select("id, title, content, mood, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
}
