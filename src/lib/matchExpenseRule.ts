import type { SupabaseClient } from "@supabase/supabase-js";

type ExpenseRuleRow = {
  id: string;
  keyword: string;
  match_type: "contains" | "exact";
  category_id: string | null;
  priority: number;
};

export async function matchExpenseRule(
  description: string,
  userId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from("expense_rules")
    .select("id, keyword, match_type, category_id, priority")
    .eq("user_id", userId)
    .order("priority", { ascending: false });

  if (error || !data) {
    return null;
  }

  const desc = description.trim().toLowerCase();

  for (const rule of data as ExpenseRuleRow[]) {
    const kw = rule.keyword.trim().toLowerCase();
    if (!kw) {
      continue;
    }

    const matched =
      rule.match_type === "exact"
        ? desc === kw
        : desc.includes(kw);

    if (matched && rule.category_id) {
      return rule.category_id;
    }
  }

  return null;
}
