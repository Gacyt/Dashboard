import { NextResponse } from "next/server";
import { matchExpenseRule } from "@/lib/matchExpenseRule";
import { getWebhookUserByToken } from "@/lib/supabase/admin";

type ExpenseWebhookPayload = {
  amount: number;
  category?: string | null;
  description?: string;
};

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const auth = await getWebhookUserByToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as ExpenseWebhookPayload;
  if (!payload.amount || Number(payload.amount) <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const description = (payload.description ?? "").trim();
  const providedCategory = payload.category?.trim() ?? null;

  let categoryId: string | null = null;
  if (!providedCategory || providedCategory.toLowerCase() === "none") {
    categoryId = await matchExpenseRule(description, auth.user.id, auth.supabase);
  }

  const categoryResolved = Boolean(categoryId);
  const categoryText = providedCategory && providedCategory.length > 0
    ? providedCategory
    : categoryResolved
      ? "auto"
      : "other";

  const { error } = await auth.supabase
    .from("expenses")
    .insert({
      user_id: auth.user.id,
      amount: Number(payload.amount),
      category: categoryText,
      category_id: categoryId,
      description,
      expense_type: "normal",
      type: "expense"
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    category_resolved: categoryResolved
  });
}
