export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  expense_type: "normal" | "extraordinary";
  created_at: string;
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

