"use client";

import { useCallback, useEffect, useState } from "react";
import { JournalEntry } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { NX_CREATE_HUB_CREATED_EVENT } from "@/lib/createHub";

export function useJournalEntries(userId: string) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, title, content, mood, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      throw error;
    }

    return (data ?? []) as JournalEntry[];
  }, [supabase, userId]);

  const refresh = useCallback(async () => {
    const rows = await fetchEntries();
    setEntries(rows);
    setLoading(false);
  }, [fetchEntries]);

  useEffect(() => {
    let active = true;
    void fetchEntries().then((rows) => {
      if (!active) {
        return;
      }
      setEntries(rows);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [fetchEntries]);

  useEffect(() => {
    const onCreated = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string }>).detail;
      if (detail?.kind === "journal") {
        void refresh();
      }
    };

    window.addEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);
    return () => {
      window.removeEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);
    };
  }, [refresh]);

  const addEntry = async (
    payload:
      | string
      | {
          title: string;
          content: string;
          mood: "Great" | "Good" | "Neutral" | "Bad";
        }
  ) => {
    const next =
      typeof payload === "string"
        ? { title: "Daily note", content: payload, mood: "Neutral" as const }
        : payload;

    if (!next.content.trim() || !next.title.trim()) {
      return;
    }
    const { data } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        title: next.title.trim(),
        content: next.content.trim(),
        mood: next.mood
      })
      .select("id, title, content, mood, created_at")
      .single();
    if (data) {
      setEntries((prev) => [data as JournalEntry, ...prev]);
    }
  };

  const deleteEntry = async (entryId: string) => {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId)
      .eq("user_id", userId);

    if (!error) {
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    }
  };

  return { entries, loading, addEntry, deleteEntry, refresh };
}
