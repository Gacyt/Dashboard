// src/app/api/webhook/expense/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // buscar usuario por token
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("webhook_token", token)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // insertar gasto
    const { error: insertError } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        amount: data.amount,
        category: data.category || "other",
        description: data.description || ""
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}