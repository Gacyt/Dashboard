export type Expense = {
  id: string;
  amount: number;
  category: string;
  category_id?: string | null;
  description: string;
  expense_type: "normal" | "extraordinary";
  type?: "expense" | "extraordinary";
  created_at: string;
};

export type SpendingCategory = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  monthly_budget: number;
  created_at: string;
};

export type ExpenseRule = {
  id: string;
  user_id: string;
  keyword: string;
  match_type: "contains" | "exact";
  category_id: string | null;
  priority: number;
  created_at: string;
  spending_categories?:
    | Pick<SpendingCategory, "id" | "name" | "color">
    | Array<Pick<SpendingCategory, "id" | "name" | "color">>
    | null;
};

export type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  source: string | null;
  type: "salary" | "freelance" | "transfer" | "refund" | "other";
  date: string;
  created_at: string;
};

export type MonthlyBudget = {
  id: string;
  user_id: string;
  month: string;
  total: number;
  created_at: string;
};

export type GymDay = {
  id: string;
  user_id: string;
  date: string;
  type: "workout" | "rest";
  label: string | null;
  muscles: string[];
};

export type ExerciseSetRow = {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  notes: string | null;
};

export type Exercise = {
  id: string;
  gym_day_id: string;
  user_id: string;
  name: string;
  notes: string | null;
  photo_url: string | null;
  order_index: number;
  created_at: string;
  exercise_sets: ExerciseSetRow[];
};

export type Budget = {
  id: string;
  limit_amount: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "Completed";
  due_date: string | null;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
};

export type HabitLog = {
  id: string;
  date: string;
  completed: boolean;
};

export type Habit = {
  id: string;
  name: string;
  target_per_day: number;
  created_at: string;
  habit_logs: HabitLog[];
};

export type WorkoutSet = {
  exercise: string;
  weight: number;
  reps: number;
};

export type Workout = {
  id: string;
  name: string;
  date: string;
  workout_sets: WorkoutSet[];
};

export type WorkoutWeekdayExercise = {
  id: string;
  workout_weekday_id: string;
  name: string;
  notes: string | null;
  target_sets: number;
  target_reps: number;
  order_index: number;
  created_at: string;
};

export type WorkoutProgressLog = {
  id: string;
  workout_weekday_exercise_id: string;
  user_id: string;
  performed_on: string;
  weight_kg: number | null;
  reps: number | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
};

export type WorkoutWeekday = {
  id: string;
  user_id: string;
  weekday: number;
  title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  workout_weekday_exercises: WorkoutWeekdayExercise[];
};

export type BodyMetric = {
  id: string;
  weight: number;
  height: number;
  calories: number;
  date: string;
};

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: "Great" | "Good" | "Neutral" | "Bad";
  created_at: string;
};

export type Profile = {
  id: string;
  webhook_token: string;
};

export type DashboardData = {
  profile: Profile;
  expenses: Expense[];
  budget: Budget | null;
  tasks: Task[];
  events: EventItem[];
  habits: Habit[];
  workouts: Workout[];
  bodyMetrics: BodyMetric[];
  journalEntries: JournalEntry[];
};
