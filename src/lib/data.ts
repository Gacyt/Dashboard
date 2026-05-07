import { SupabaseClient } from "@supabase/supabase-js";
import { DashboardData, Profile } from "./types";

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, webhook_token")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to load dashboard data: ${profileError.message}`);
  }

  if (!profileData) {
    const { error: createProfileError } = await supabase.from("profiles").insert({
      id: userId,
      webhook_token: crypto.randomUUID()
    });

    if (createProfileError && createProfileError.code !== "23505") {
      throw new Error(
        `Failed to create missing user profile: ${createProfileError.message}`
      );
    }
  }

  const [
    expensesResult,
    budgetResult,
    tasksResult,
    eventsResult,
    habitsResult,
    workoutsResult,
    bodyMetricsResult,
    journalResult,
    refreshedProfileResult
  ] = (await Promise.all([
    supabase
      .from("expenses")
      .select("id, amount, category, description, expense_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("budgets")
      .select("id, limit_amount")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("id, title, description, status, due_date, created_at")
      .eq("user_id", userId)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(20),
    supabase
      .from("events")
      .select("id, title, start_time, end_time")
      .eq("user_id", userId)
      .order("start_time", { ascending: true })
      .limit(20),
    supabase
      .from("habits")
      .select("id, name, target_per_day, created_at, habit_logs(id, date, completed)")
      .eq("user_id", userId)
      .order("name", { ascending: true }),
    supabase
      .from("workouts")
      .select("id, name, date, workout_sets(exercise, weight, reps)")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(10),
    supabase
      .from("body_metrics")
      .select("id, weight, height, calories, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(15),
    supabase
      .from("journal_entries")
      .select("id, title, content, mood, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase.from("profiles").select("id, webhook_token").eq("id", userId).single()
  ])) as [
    QueryResult<DashboardData["expenses"]>,
    QueryResult<DashboardData["budget"]>,
    QueryResult<DashboardData["tasks"]>,
    QueryResult<DashboardData["events"]>,
    QueryResult<DashboardData["habits"]>,
    QueryResult<DashboardData["workouts"]>,
    QueryResult<DashboardData["bodyMetrics"]>,
    QueryResult<DashboardData["journalEntries"]>,
    QueryResult<Profile>
  ];

  const firstError = [
    expensesResult.error,
    budgetResult.error,
    tasksResult.error,
    eventsResult.error,
    habitsResult.error,
    workoutsResult.error,
    bodyMetricsResult.error,
    journalResult.error,
    refreshedProfileResult.error
  ].find((error) => error !== null);

  if (firstError) {
    throw new Error(`Failed to load dashboard data: ${firstError.message}`);
  }

  if (!refreshedProfileResult.data) {
    throw new Error("Failed to load user profile.");
  }

  return {
    profile: refreshedProfileResult.data,
    expenses: expensesResult.data ?? [],
    budget: budgetResult.data ?? null,
    tasks: tasksResult.data ?? [],
    events: eventsResult.data ?? [],
    habits: habitsResult.data ?? [],
    workouts: workoutsResult.data ?? [],
    bodyMetrics: bodyMetricsResult.data ?? [],
    journalEntries: journalResult.data ?? []
  };
}

