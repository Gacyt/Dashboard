"use client";

import { useEffect, useState } from "react";
import { JournalEntry } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function useJournalEntries(userId: string) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("journal_entries")
      .select("id, title, content, mood, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setEntries((data ?? []) as JournalEntry[]));
  }, [supabase, userId]);

  const addEntry = async (content: string) => {
    if (!content.trim()) {
      return;
    }
    const { data } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        title: "Daily note",
        content,
        mood: "Neutral"
      })
      .select("id, title, content, mood, created_at")
      .single();
    if (data) {
      setEntries((prev) => [data as JournalEntry, ...prev.slice(0, 4)]);
    }
  };

  return { entries, addEntry };
}
