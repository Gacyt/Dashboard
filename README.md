# Nexus LifeOS Dashboard

Template-faithful LifeOS SaaS dashboard built with Next.js App Router, Supabase, Recharts, and a hybrid webhook architecture (local Next.js route + production Python FastAPI endpoint).

## Setup

### 1. Supabase
1. Create a Supabase project.
2. Enable Auth (Email/Password provider).
3. Run `supabase/schema.sql` in the SQL editor.

### 2. Environment Variables
Create `.env.local`:

```bash
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 3. Install
```bash
npm install
```

### 4. Run
```bash
npm run dev
```
Local webhook testing uses the Next.js routes at:
- `src/app/api/webhook/expense/route.ts`
- `src/app/api/webhook/deposit/route.ts`

### 5. Deploy
Deploy on Vercel.
On Vercel, `/api/*` requests are routed to Python serverless functions under `/api`.

## Webhooks

```http
POST /api/webhook/expense?token=USER_TOKEN
Content-Type: application/json

{
  "amount": 42.5,
  "category": "food",
  "description": "Lunch"
}
```

```http
POST /api/webhook/deposit?token=USER_TOKEN
Content-Type: application/json

{
  "amount": 850000,
  "source": "Salary",
  "type": "salary",
  "date": "2026-05-01"
}
```

## Features
- Finance tracking with budget summary and category chart.
- Category management + expense auto-rules.
- Monthly budget allocation page.
- Gym routine page with exercise sets and photo upload support.
- Deposit/income tracking and net balance.
- Tasks and calendar module cards.
- Habits module with completion progress.
- Fitness module with body-metric charts.
- Journal module with mood distribution.
- Supabase Auth + protected routes + RLS-backed multi-user data isolation.
- Local Next.js webhook route for dev + FastAPI webhook endpoint for production expense ingestion.

## Notes
- UI style is adapted from the original template design language (colors, spacing, typography, borders, and card feel) without redesigning the visual identity.
- Responsive layout keeps card proportions while adapting to mobile (1 column), tablet (2 columns), and desktop (3-4 columns).
