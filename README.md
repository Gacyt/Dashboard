# Nexus LifeOS Dashboard

Nexus LifeOS is a production-oriented personal operating system built with Next.js + Supabase.  
It centralizes finance, habits, tasks, journal, workouts, categories, budget allocation, analytics, and webhook automation into one modular platform.

---

## Project overview

Nexus LifeOS is designed as a calm, high-signal control layer for personal performance:

- **Finance**: expenses, deposits, category budgets, auto-categorization rules
- **Habits**: daily completion, streak feedback, trend visualization
- **Tasks**: actionable queue with due-date urgency
- **Journal**: timeline by day with mood context and focused reading mode
- **Workouts**: weekly recurring split (weekday-based), exercises, progression logs
- **Analytics**: spending distribution and habit trend charts
- **Webhook ingestion**: external expense capture via token-authenticated endpoint

---

## Architecture

### Frontend

- **Next.js App Router**
- **React + TypeScript**
- **Tailwind-enabled project with global design system CSS**
- **Framer Motion** for page/modal interaction animation
- **Recharts** for analytics

### Backend

- **Next.js API Routes** under `src/app/api/**`
- Supabase client usage for browser and server contexts

### Data layer

- **Supabase Postgres**
- **Supabase Auth**
- **Row Level Security (RLS)** for per-user data isolation

---

## Folder structure (high-level)

```text
src/
  app/
    dashboard/**              # App Router pages
    api/**                    # Next.js route handlers
  components/
    dashboard/**              # Dashboard cards/charts
    pages/**                  # Module page clients
    layout/**                 # App shell, sidebar, topbar
    ui/**                     # Shared modal/card/theme components
  hooks/**                    # Data hooks per module
  lib/**                      # Types, Supabase clients, helpers
supabase/
  schema.sql                  # Main DB schema + indexes + RLS policies
```

---

## Setup guide

## 1) Prerequisites

- Node.js 20+
- npm 10+
- Supabase project with Auth enabled (Email/Password)

## 2) Install dependencies

```bash
npm install
```

## 3) Configure environment variables

Create `.env.local` at repository root:

```bash
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Variable purpose

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser anon key |
| `SUPABASE_URL` | Server-side Supabase URL |
| `SUPABASE_KEY` | Server-side key used by server clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for privileged webhook token lookup |

## 4) Initialize database

Run `supabase/schema.sql` in Supabase SQL Editor.

```sql
-- paste contents of supabase/schema.sql and run
```

## 5) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Database and migrations

This project currently uses a schema-first SQL script:

- **Schema script**: `supabase/schema.sql`
- Run this script whenever bootstrapping a new environment.

### Core tables

- `profiles`
- `expenses`
- `spending_categories`
- `expense_rules`
- `deposits`
- `monthly_budgets`
- `tasks`
- `habits`
- `habit_logs`
- `journal_entries`
- `workout_weekdays`
- `workout_weekday_exercises`
- `workout_progress_logs`
- `workouts`, `workout_sets`, `body_metrics`
- `gym_days`, `exercises`, `exercise_sets`
- `budgets`, `events`

### Triggers and functions

- `public.handle_new_user()` function
- `on_auth_user_created` trigger on `auth.users`
  - creates `profiles` record automatically on signup

### Webhook token generation

- `profiles.webhook_token` defaults to random bytes (`encode(gen_random_bytes(18), 'hex')`)
- Token can be regenerated in-app (Webhook page) or via:
  - `POST /api/dashboard/webhook/regenerate`

### Foreign keys

The schema includes explicit relations such as:

- `expenses.user_id -> profiles.id`
- `expenses.category_id -> spending_categories.id`
- `habit_logs.habit_id -> habits.id`
- `workout_weekday_exercises.workout_weekday_id -> workout_weekdays.id`
- `workout_progress_logs.workout_weekday_exercise_id -> workout_weekday_exercises.id`

### RLS policies

RLS is enabled on all user data tables.  
Policies are owner-scoped (`auth.uid() = user_id` / relational checks for child tables), including:

- direct ownership tables (`expenses`, `tasks`, `journal_entries`, `deposits`, etc.)
- relational policies for:
  - `habit_logs`
  - `workout_sets`
  - `workout_weekday_exercises`
  - `exercise_sets`

---

## Webhook ingestion

## Endpoint

```http
POST /api/webhook/expense?token=USER_TOKEN
Content-Type: application/json
```

## Required and optional JSON fields

```json
{
  "amount": 2500,
  "category": "food",
  "description": "McDonalds"
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `amount` | Yes | number | Must be > 0 |
| `category` | No | string | If omitted or `none`, rule-based category matching can run |
| `description` | No | string | Saved with expense and used by rule matching |

## Expected responses

- `200`: `{ "success": true, "category_resolved": true|false }`
- `400`: missing token or invalid amount
- `401`: invalid token
- `500`: database/server failure

## Authentication token behavior

- Token belongs to current user profile (`profiles.webhook_token`)
- Token is passed in query string (`?token=...`)
- Regenerate token if exposed

---

## Webhook usage examples

## cURL

```bash
curl -X POST "https://YOUR_DOMAIN/api/webhook/expense?token=USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 2500, \"category\": \"food\", \"description\": \"McDonalds\"}"
```

## Python requests

```python
import requests

endpoint = "https://YOUR_DOMAIN/api/webhook/expense?token=USER_TOKEN"
payload = {
    "amount": 2500,
    "category": "food",
    "description": "McDonalds"
}

response = requests.post(endpoint, json=payload, timeout=10)
print(response.status_code)
print(response.json())
```

## Apple Shortcuts integration

1. Add **Get Contents of URL**
2. Set URL to your webhook endpoint with token
3. Set Method = `POST`
4. Set Request Body = `JSON`
5. Add keys: `amount`, `category`, `description`
6. Run and verify in **Finance → Recent Expenses**

---

## Development workflow

## Run app

```bash
npm run dev
```

## Lint

```bash
npm run lint
```

## Production build

```bash
npm run build
```

---

## Vercel deployment

1. Push repository to GitHub
2. Import project in Vercel
3. Set all `.env.local` variables in Vercel Project Settings
4. Deploy
5. Ensure Supabase URL/keys point to production project

Notes:

- Next.js API routes under `src/app/api/**` are deployed as serverless functions.
- Webhook endpoint path remains `/api/webhook/expense`.

---

## Mobile responsiveness

The app includes:

- responsive app shell
- mobile bottom navigation
- modal/sheet flows for create and edit actions
- adaptive chart and card layout behavior

Use device emulation and real mobile checks before release.

---

## Troubleshooting

## Build fails with TypeScript config errors

- Ensure `tsconfig.json` uses compatible values with your TypeScript/Next versions.

## Webhook returns 401

- Token is invalid or stale.
- Regenerate token in dashboard webhook page and update automation.

## Data not visible after login

- Verify `supabase/schema.sql` was fully executed.
- Confirm RLS policies exist and match authenticated user ownership.

## Auth works but profile-dependent features fail

- Confirm `handle_new_user` trigger exists and creates `profiles` row on signup.

## Charts or module data are empty

- Seed module data (expenses, habits, tasks, logs) for that user.

---

## Security notes

- Do not expose service role key in client code.
- Rotate webhook tokens if leaked.
- Keep RLS enabled in all environments.

---

## License

Private/internal project unless otherwise specified by repository owner.
