"use client";

import { useEffect, useMemo, useState } from "react";
import { Task } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { NX_CREATE_HUB_CREATED_EVENT } from "@/lib/createHub";

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const refresh = () => {
      supabase
        .from("tasks")
        .select("id, title, description, status, due_date, created_at")
        .eq("user_id", userId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .then(({ data }) => setTasks((data ?? []) as Task[]));
    };

    const onCreated = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string }>).detail;
      if (detail?.kind === "task") {
        refresh();
      }
    };

    refresh();
    window.addEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);

    return () => {
      window.removeEventListener(NX_CREATE_HUB_CREATED_EVENT, onCreated as EventListener);
    };
  }, [supabase, userId]);

  const pendingCount = useMemo(
    () => tasks.filter((task) => task.status === "Pending").length,
    [tasks]
  );

  const toggleTask = async (task: Task) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    const { data } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", task.id)
      .select("id, title, description, status, due_date, created_at")
      .single();
    if (data) {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? (data as Task) : item)));
    }
  };

  const addTask = async (
    payload:
      | string
      | { title: string; description?: string; due_date?: string | null }
  ) => {
    const next =
      typeof payload === "string"
        ? { title: payload, description: "", due_date: null as string | null }
        : payload;

    const dueDate = next.due_date
      ? new Date(`${next.due_date}T12:00:00.000Z`).toISOString()
      : null;

    const { data } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: next.title.trim(),
        description: next.description?.trim() ?? "",
        status: "Pending",
        due_date: dueDate
      })
      .select("id, title, description, status, due_date, created_at")
      .single();
    if (data) {
      setTasks((prev) => [...prev, data as Task]);
    }
  };

  return { tasks, pendingCount, toggleTask, addTask };
}
