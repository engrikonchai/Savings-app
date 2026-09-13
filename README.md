# [APP NAME]

A goal-based savings app: pick a goal type, set a target and a date, and track real
progress — weekly target, predicted completion date, and "Dream Days" gained or lost on
every contribution or impulse purchase.

Signed-in users get real authentication and a private cloud database (Supabase): your goal
and every transaction are saved to your account and load back on any device. Without an
account, the app shows a local, throwaway demo — nothing you do there is saved anywhere.

## Stack

Vite + React + TypeScript, no UI framework — plain CSS custom properties for the light/dark
theme (Apple system blue, iOS-native spacing and type). Auth + database via
[Supabase](https://supabase.com) (`@supabase/supabase-js`). Built to be renamed: every
visible mention of the app name is the placeholder `[APP NAME]` (see `TopBar.tsx` and
`Celebration.tsx`), so swapping in a real name is a single find-and-replace.

## Run locally

```bash
npm install
```

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. Open **SQL Editor** → **New query**, paste the entire contents of
   [`supabase-schema.sql`](supabase-schema.sql), and click **Run**. This creates the
   `profiles`, `goals`, and `transactions` tables, indexes, Row Level Security policies, and
   the trigger that creates a profile automatically on sign-up.
3. In **Project Settings → API**, copy the **Project URL** and the **anon / public** key
   (never the `service_role` key — that one must never be used in frontend code).
4. Copy `.env.example` to `.env` and fill in those two values:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. By default Supabase requires email confirmation before a new account can sign in. For
   local testing you can turn this off in **Authentication → Providers → Email → Confirm
   email**, or just click the confirmation link Supabase emails to the address you sign up
   with.

Without a `.env` (or with it left blank), the app still runs — it just skips the auth
screen and always shows the local demo, since there's nowhere to sign in to.

### 2. Run it

```bash
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`). Resize the browser to a
phone width (375–430px) to see it as intended — it's a mobile-first layout with no desktop
breakpoint.

```bash
npm run build    # type-checks and produces a production build in dist/
npm run preview  # serves that production build locally
```

When deploying (Vercel, Netlify, etc.), set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as environment variables in that platform's project settings —
`.env` itself is git-ignored and never committed.

## What's implemented

- **Auth**: email/password sign up and sign in via Supabase, with a persistent session
  (stays signed in after closing and reopening the app). Log out from Profile.
- **Guest/demo mode**: not signed in? See a fully interactive preview (the "My First Car"
  sample goal) with a "Sign in to save your progress" prompt — nothing in it touches the
  database, and it's never created as a real goal for a real account.
- First-open flow for real accounts → goal type picker (First Car, Travel, New Phone,
  Gaming Setup, Education, Custom) → 3-step goal creation (name, cost, target date), saved
  straight to Supabase → live dashboard.
- Dashboard: progress ring, saved/remaining, predicted date, weekly target, Add Money,
  Should I Buy It?, recent activity, and a completion CTA once the goal is reached.
- Add Money: quick amounts, a source picker, and a real "days closer" result — recorded as
  a `deposit` transaction immediately.
- Dream Days ("Should I buy it?"): shows the day cost before you decide, then **Skip it**
  (records a `deposit` — the money is saved instead of spent) or **Buy anyway** (records a
  `withdrawal` — the money comes back out of savings and the predicted date pushes out).
- History (full transaction timeline + this-month summary), Insights (weekly bar chart,
  best/average week, a personalized "your move this week" tip, pace projection).
- Profile: manage/edit goal, switch goal type, currency picker, notifications toggle,
  System/Light/Dark appearance, log out.
- Goal-completion celebration with a shareable story-card mockup (`navigator.share` where
  available, clipboard fallback otherwise).
- Loading and error states throughout: session check, goal/transaction fetch, every write.

## Data model

**Signed in:** a `goals` row (name, type, target amount, target date, icon, color) plus a
`transactions` row per deposit/withdrawal, both scoped to `user_id` and protected by Row
Level Security — a user can only ever read or write their own rows. See
[`supabase-schema.sql`](supabase-schema.sql) for the full schema, and `src/lib/db.ts` for
the queries.

**Important:** a goal's saved amount is *never* stored directly. It — and the live
predicted date — are derived every time by replaying the goal's full transaction history in
order (`replayGoal` in `src/lib/calc.ts`), so they can never drift out of sync with the
ledger.

**Not signed in (guest):** device-local prefs only — currency, appearance, notifications —
persist to `localStorage` under `savings-app-state-v1`. The demo goal and its sample
transactions are hardcoded and reset every time the page reloads.

## Never do this

- Never put the Supabase `service_role`/secret key in frontend code, `.env`, or anywhere
  that ships to the browser. Only the `anon`/`publishable` key belongs in `VITE_SUPABASE_ANON_KEY`.
- Never commit `.env` — it's already in `.gitignore`. Commit `.env.example` (blank values)
  instead.
