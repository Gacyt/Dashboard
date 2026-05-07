import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

export async function POST() {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const { supabase, user } = auth;
  const newToken = randomUUID().replaceAll("-", "");
  const { error } = await supabase
    .from("profiles")
    .update({ webhook_token: newToken })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ webhook_token: newToken });
}
