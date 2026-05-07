import { redirect } from "next/navigation";
import JournalPageClient from "@/components/journal/JournalPageClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { JournalEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("id, title, content, mood, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(error.message);
  }

  return <JournalPageClient initialEntries={(data ?? []) as JournalEntry[]} />;
}
