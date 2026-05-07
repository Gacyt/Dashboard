import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

export async function GET() {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("profiles")
    .select("webhook_token")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ webhook_token: data.webhook_token });
}
