export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  created_at: string;
};

export type Budget = {
  id: string;
  limit_amount: number;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
};

export type EventItem = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
};

export type HabitLog = {
  date: string;
  completed: boolean;
};

export type Habit = {
  id: string;
  name: string;
  target_per_day: number;
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
  content: string;
  mood: string;
  created_at: string;
};

export type DashboardData = {
  expenses: Expense[];
  budget: Budget | null;
  tasks: Task[];
  events: EventItem[];
  habits: Habit[];
  workouts: Workout[];
  bodyMetrics: BodyMetric[];
  journalEntries: JournalEntry[];
};

