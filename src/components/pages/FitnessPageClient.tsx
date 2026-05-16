"use client";

import { useEffect, useState } from "react";
import FitnessModule from "@/components/modules/FitnessModule";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { BodyMetric, Workout } from "@/lib/types";

export default function FitnessPageClient({ userId }: { userId: string }) {
  const supabase = getSupabaseBrowserClient();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);

  useEffect(() => {
    supabase
      .from("workouts")
      .select("id, name, date, workout_sets(exercise, weight, reps)")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .then(({ data }) => setWorkouts((data ?? []) as Workout[]));

    supabase
      .from("body_metrics")
      .select("id, weight, height, calories, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .then(({ data }) => setBodyMetrics((data ?? []) as BodyMetric[]));
  }, [supabase, userId]);

  return (
    <section className="nx-panel animate-fade-in-up">
      <FitnessModule workouts={workouts} bodyMetrics={bodyMetrics} />
    </section>
  );
}
