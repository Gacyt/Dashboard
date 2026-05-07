import { NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supaAuth";

type ExpensePayload = {
  amount: number;
  category: string;
  description?: string;
  expense_type?: "normal" | "extraordinary";
  date?: string;
};

export async function POST(req: Request) {
  const auth = await getAuthedSupabase();
  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await req.json()) as ExpensePayload;
  if (!payload.amount || payload.amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const expenseType =
    payload.expense_type === "extraordinary" ? "extraordinary" : "normal";
  const createdAt = payload.date
    ? new Date(`${payload.date}T12:00:00.000Z`).toISOString()
    : new Date().toISOString();

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      amount: payload.amount,
      category: payload.category || "other",
      description: payload.description ?? "",
      expense_type: expenseType,
      created_at: createdAt
    })
    .select("id, amount, category, description, expense_type, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ expense: data });
}
