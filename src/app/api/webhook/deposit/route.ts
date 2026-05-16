import { NextResponse } from "next/server";
import { getWebhookUserByToken } from "@/lib/supabase/admin";

type DepositType = "salary" | "freelance" | "transfer" | "refund" | "other";

type DepositWebhookPayload = {
  amount: number;
  source?: string;
  type?: string;
  date?: string;
};

const VALID_TYPES: DepositType[] = ["salary", "freelance", "transfer", "refund", "other"];

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

  const payload = (await req.json()) as DepositWebhookPayload;
  const amount = Number(payload.amount);
  const type = payload.type;

  if (!amount || amount <= 0 || !type) {
    return NextResponse.json({ error: "amount and type are required" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type as DepositType)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const { error } = await auth.supabase
    .from("deposits")
    .insert({
      user_id: auth.user.id,
      amount,
      source: payload.source?.trim() || null,
      type,
      date: payload.date ?? new Date().toISOString().slice(0, 10)
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
