"use client";

import { useEffect, useMemo, useState } from "react";
import { Task } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("tasks")
      .select("id, title, description, status, due_date, created_at")
      .eq("user_id", userId)
      .order("due_date", { ascending: true, nullsFirst: false })
      .then(({ data }) => setTasks((data ?? []) as Task[]));
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

  const addTask = async (title: string) => {
    const { data } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title,
        description: "",
        status: "Pending"
      })
      .select("id, title, description, status, due_date, created_at")
      .single();
    if (data) {
      setTasks((prev) => [...prev, data as Task]);
    }
  };

  return { tasks, pendingCount, toggleTask, addTask };
}
