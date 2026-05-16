-- EXTENSIONS
create extension if not exists "pgcrypto";

-- PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  webhook_token text unique not null default encode(gen_random_bytes(18), 'hex'),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- FINANCE
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric not null check (amount > 0),
  category text not null default 'other',
  description text not null default '',
  expense_type text not null default 'normal' check (expense_type in ('normal', 'extraordinary')),
  created_at timestamptz not null default now()
);

alter table expenses add column if not exists expense_type text default 'normal';
alter table expenses drop constraint if exists expenses_expense_type_check;
alter table expenses
  add constraint expenses_expense_type_check
  check (expense_type in ('normal', 'extraordinary'));

alter table expenses
  add column if not exists category_id uuid;
alter table expenses
  add column if not exists type text default 'expense';
alter table expenses drop constraint if exists expenses_type_check;
alter table expenses
  add constraint expenses_type_check
  check (type in ('expense', 'extraordinary'));

-- CATEGORY + RULES + BUDGET V3
create table if not exists spending_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  color text not null default '#00D4FF',
  monthly_budget numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists expense_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  keyword text not null,
  match_type text not null check (match_type in ('contains', 'exact')),
  category_id uuid references spending_categories(id) on delete cascade,
  priority integer not null default 0,
  created_at timestamptz not null default now()
);

alter table expenses drop constraint if exists expenses_category_id_fkey;
alter table expenses
  add constraint expenses_category_id_fkey
  foreign key (category_id)
  references spending_categories(id);

create table if not exists deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  source text,
  type text not null check (type in ('salary', 'freelance', 'transfer', 'refund', 'other')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  month text not null,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists gym_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  type text not null check (type in ('workout', 'rest')),
  label text,
  muscles text[] not null default '{}',
  unique (user_id, date)
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  gym_day_id uuid not null references gym_days(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  notes text,
  photo_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists exercise_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  set_number integer not null,
  weight_kg numeric(6,2),
  reps integer,
  notes text
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  limit_amount numeric not null check (limit_amount >= 0)
);

-- TASKS
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'Pending' check (status in ('Pending', 'Completed')),
  due_date timestamptz,
  created_at timestamptz not null default now()
);

alter table tasks add column if not exists description text not null default '';
alter table tasks add column if not exists status text not null default 'Pending';
alter table tasks add column if not exists created_at timestamptz not null default now();
alter table tasks drop constraint if exists tasks_status_check;
alter table tasks
  add constraint tasks_status_check
  check (status in ('Pending', 'Completed'));

-- EVENTS
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null check (end_time >= start_time)
);

-- HABITS
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  target_per_day int not null check (target_per_day > 0),
  created_at timestamptz not null default now()
);

alter table habits add column if not exists created_at timestamptz not null default now();

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  unique (habit_id, date)
);

-- FITNESS
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  date date not null
);

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise text not null,
  weight numeric not null default 0,
  reps int not null default 0
);

create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  weight numeric not null default 0,
  height numeric not null default 0,
  calories int not null default 0,
  date date not null
);

-- RECURRING WORKOUT MODEL (WEEKDAY-BASED)
create table if not exists workout_weekdays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  title text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, weekday)
);

create table if not exists workout_weekday_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_weekday_id uuid not null references workout_weekdays(id) on delete cascade,
  name text not null,
  notes text,
  target_sets int not null default 4 check (target_sets > 0),
  target_reps int not null default 8 check (target_reps > 0),
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists workout_progress_logs (
  id uuid primary key default gen_random_uuid(),
  workout_weekday_exercise_id uuid not null references workout_weekday_exercises(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  performed_on date not null default current_date,
  weight_kg numeric(6,2),
  reps int,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique (workout_weekday_exercise_id, performed_on)
);

-- JOURNAL
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'Untitled',
  content text not null,
  mood text not null default 'Neutral' check (mood in ('Great', 'Good', 'Neutral', 'Bad')),
  created_at timestamptz not null default now()
);

alter table journal_entries add column if not exists title text not null default 'Untitled';
alter table journal_entries alter column mood set default 'Neutral';
alter table journal_entries drop constraint if exists journal_entries_mood_check;
alter table journal_entries
  add constraint journal_entries_mood_check
  check (mood in ('Great', 'Good', 'Neutral', 'Bad'));

create index if not exists idx_expenses_user_created on expenses(user_id, created_at desc);
create index if not exists idx_expenses_user_category_created on expenses(user_id, category_id, created_at desc);
create index if not exists idx_tasks_user_due on tasks(user_id, due_date);
create index if not exists idx_events_user_start on events(user_id, start_time);
create index if not exists idx_habits_user on habits(user_id);
create index if not exists idx_workouts_user_date on workouts(user_id, date desc);
create index if not exists idx_body_metrics_user_date on body_metrics(user_id, date desc);
create index if not exists idx_workout_weekdays_user_weekday on workout_weekdays(user_id, weekday);
create index if not exists idx_workout_weekday_exercises_day_order on workout_weekday_exercises(workout_weekday_id, order_index);
create index if not exists idx_workout_progress_logs_user_date on workout_progress_logs(user_id, performed_on desc);
create index if not exists idx_journal_user_created on journal_entries(user_id, created_at desc);
create index if not exists idx_categories_user_name on spending_categories(user_id, name);
create index if not exists idx_rules_user_priority on expense_rules(user_id, priority desc);
create index if not exists idx_deposits_user_date on deposits(user_id, date desc);
create index if not exists idx_monthly_budgets_user_month on monthly_budgets(user_id, month);
create index if not exists idx_gym_days_user_date on gym_days(user_id, date desc);
create index if not exists idx_exercises_day_order on exercises(gym_day_id, order_index asc);
create index if not exists idx_exercise_sets_exercise_set on exercise_sets(exercise_id, set_number asc);

-- ENABLE RLS
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table budgets enable row level security;
alter table tasks enable row level security;
alter table events enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table workouts enable row level security;
alter table workout_sets enable row level security;
alter table body_metrics enable row level security;
alter table workout_weekdays enable row level security;
alter table workout_weekday_exercises enable row level security;
alter table workout_progress_logs enable row level security;
alter table journal_entries enable row level security;
alter table spending_categories enable row level security;
alter table expense_rules enable row level security;
alter table deposits enable row level security;
alter table monthly_budgets enable row level security;
alter table gym_days enable row level security;
alter table exercises enable row level security;
alter table exercise_sets enable row level security;

-- POLICIES
drop policy if exists profiles_owner_access on profiles;
create policy profiles_owner_access on profiles
for all using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists expenses_owner_access on expenses;
create policy expenses_owner_access on expenses
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists budgets_owner_access on budgets;
create policy budgets_owner_access on budgets
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists tasks_owner_access on tasks;
create policy tasks_owner_access on tasks
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists events_owner_access on events;
create policy events_owner_access on events
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists habits_owner_access on habits;
create policy habits_owner_access on habits
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists workouts_owner_access on workouts;
create policy workouts_owner_access on workouts
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists body_owner_access on body_metrics;
create policy body_owner_access on body_metrics
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists workout_weekdays_owner_access on workout_weekdays;
create policy workout_weekdays_owner_access on workout_weekdays
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists workout_progress_logs_owner_access on workout_progress_logs;
create policy workout_progress_logs_owner_access on workout_progress_logs
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists journal_owner_access on journal_entries;
create policy journal_owner_access on journal_entries
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists categories_owner_access on spending_categories;
create policy categories_owner_access on spending_categories
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists rules_owner_access on expense_rules;
create policy rules_owner_access on expense_rules
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists deposits_owner_access on deposits;
create policy deposits_owner_access on deposits
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists monthly_budgets_owner_access on monthly_budgets;
create policy monthly_budgets_owner_access on monthly_budgets
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists gym_days_owner_access on gym_days;
create policy gym_days_owner_access on gym_days
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists exercises_owner_access on exercises;
create policy exercises_owner_access on exercises
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RELATIONAL POLICIES
drop policy if exists habit_logs_access on habit_logs;
create policy habit_logs_access on habit_logs
for all using (
  exists (
    select 1
    from habits
    where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from habits
    where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
  )
);

drop policy if exists workout_sets_access on workout_sets;
create policy workout_sets_access on workout_sets
for all using (
  exists (
    select 1
    from workouts
    where workouts.id = workout_sets.workout_id
      and workouts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from workouts
    where workouts.id = workout_sets.workout_id
      and workouts.user_id = auth.uid()
  )
);

drop policy if exists workout_weekday_exercises_access on workout_weekday_exercises;
create policy workout_weekday_exercises_access on workout_weekday_exercises
for all using (
  exists (
    select 1
    from workout_weekdays
    where workout_weekdays.id = workout_weekday_exercises.workout_weekday_id
      and workout_weekdays.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from workout_weekdays
    where workout_weekdays.id = workout_weekday_exercises.workout_weekday_id
      and workout_weekdays.user_id = auth.uid()
  )
);

drop policy if exists exercise_sets_access on exercise_sets;
create policy exercise_sets_access on exercise_sets
for all using (
  exists (
    select 1
    from exercises
    where exercises.id = exercise_sets.exercise_id
      and exercises.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from exercises
    where exercises.id = exercise_sets.exercise_id
      and exercises.user_id = auth.uid()
  )
);
