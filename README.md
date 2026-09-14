# Dreamsaver (by OLYVI)

A multi-goal savings app: create one or more goals, set a target and a date for each, and
track real progress — weekly target, predicted completion date, and "Dream Days" gained or
lost on every contribution or impulse purchase.

Signed-in users get real authentication and a private cloud database (Supabase): every goal
and every transaction is saved to your account and loads back on any device. Without an
account, the app shows a local, throwaway demo — nothing you do there is saved anywhere.

Dreamsaver is one of OLYVI's small life-improvement apps — see the "by OLYVI" byline on the
sign-in screen and in Profile. OLYVI branding is intentionally minimal here; the app itself
keeps its own iOS-blue visual identity.

## Stack

Vite + React + TypeScript, no UI framework — plain CSS custom properties for the light/dark
theme (Apple system blue, iOS-native spacing and type). Auth + database via
[Supabase](https://supabase.com) (`@supabase/supabase-js`).

## Run locally

```bash
npm install
```

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. Open **SQL Editor** → **New query**, paste the entire contents of
   [`supabase-schema.sql`](supabase-schema.sql), and click **Run**. This creates the
   `profiles`, `goals`, and `transactions` tables, indexes, Row Level Security policies, and
   the trigger that creates a profile automatically on sign-up. It's safe to re-run.
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
6. **Forgot-password emails**: in **Authentication → URL Configuration**, add your local dev
   URL (e.g. `http://localhost:5173`) and your deployed URL to **Redirect URLs** — Supabase's
   reset-password email links back to whichever origin sent the request, and rejects
   redirects to origins not on that list.

Without a `.env` (or with it left blank), the app still runs — it just skips the auth screen
and always shows the local demo, since there's nowhere to sign in to.

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
npm run lint      # ESLint over the whole project
```

When deploying (Vercel, Netlify, etc.), set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as environment variables in that platform's project settings —
`.env` itself is git-ignored and never committed.

## What's implemented

- **Auth**: email/password sign up and sign in via Supabase, forgot-password (email reset
  link → in-app "set a new password" screen), log out, and a persistent session (stays
  signed in after closing and reopening the app) with proper loading/disabled/error states
  throughout.
- **Guest/demo mode**: not signed in? See a fully interactive preview (the "My First Car"
  sample goal) with a "Sign in to save your progress" prompt — nothing in it touches the
  database, and it's never created as a real goal for a real account.
- **Multiple goals**: create as many goals as you like, each with its own type/icon, name,
  target amount, target date, and accent color. View, edit, or delete any of them from
  Profile → Manage goals; the goals list shows a cross-goal summary (total saved, total
  target, overall progress). Dashboard shows one goal at a time with a chip switcher when you
  have more than one.
- Dashboard: progress ring, saved/remaining, predicted date, weekly target, Add Money,
  Should I Buy It?, recent activity, and a completion CTA once the goal is reached.
- Add Money: quick amounts, a source picker, and a real "days closer" result — recorded as
  a `deposit` transaction immediately.
- Dream Days ("Should I buy it?"): shows the day cost before you decide, then **Skip it**
  (records a `deposit` — the money is saved instead of spent) or **Buy anyway** (records a
  `withdrawal` — the money comes back out of savings and the predicted date pushes out).
- History (full transaction timeline + this-month summary, with per-transaction delete —
  the goal's saved amount and predicted date update immediately to match), Insights (weekly
  bar chart, best/average week, a personalized "your move this week" tip, pace projection).
- Profile: manage/edit/delete goals, currency picker, notifications toggle, System/Light/Dark
  appearance, log out, "Dreamsaver by OLYVI" credit.
- Goal-completion celebration with a shareable story-card mockup (`navigator.share` where
  available, clipboard fallback otherwise).
- Loading and error states throughout: session check, goal/transaction fetch (with a retry
  screen if the initial load fails outright), every write, empty states for no goals / no
  transactions / a brand-new account.

## Data model

**Signed in:** a `goals` row (name, type, target amount, target date, icon, color) per goal,
plus a `transactions` row per deposit/withdrawal, all scoped to `user_id` and protected by
Row Level Security — a user can only ever read or write their own rows, and can only log a
transaction against a goal they themselves own (see `supabase-schema.sql`'s
`transactions_insert_own` policy). See [`supabase-schema.sql`](supabase-schema.sql) for the
full schema, and `src/lib/db.ts` for the queries.

**Important:** a goal's saved amount is *never* stored directly. It — and the live
predicted date — are derived every time by replaying the goal's full transaction history in
order (`replayGoal` in `src/lib/calc.ts`), so they can never drift out of sync with the
ledger. The same is true of the cross-goal dashboard totals (`aggregateTotals`, also in
`calc.ts`): always summed fresh from every goal's own derived saved amount.

**Not signed in (guest):** device-local prefs only — currency, appearance, notifications —
persist to `localStorage` under `savings-app-state-v1`. The demo goal and its sample
transactions are hardcoded and reset every time the page reloads.

## Mobile: PWA today, Capacitor-ready for iOS

The whole app is already built mobile-first and safe-area-aware (see the `--safe-*` CSS
variables in `src/styles/global.css` and the helpers in `src/lib/layout.ts`): it accounts for
the notch/Dynamic Island, the home indicator, on-screen keyboard, and has no hover-dependent
interactions.

**PWA (installable today, for testing on your phone without an App Store build):**
`public/manifest.webmanifest`, `public/icons/*`, and a minimal same-origin-only service
worker (`public/sw.js`, registered in `src/main.tsx`) are already wired up. On an iPhone,
open the deployed site in Safari → Share → **Add to Home Screen** to install it standalone.

**Capacitor (for a real native iOS build later):** `capacitor.config.ts` documents the setup
(app id, `webDir: dist`) but `@capacitor/core`/`@capacitor/cli` are **not** installed and no
`ios/` project exists yet — that's deliberate, so this stays a plain web app until you're
ready to package it. When you are:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npm run build && npx cap sync ios
npx cap open ios
```
The PWA service worker checks for `window.Capacitor` and skips registering itself inside a
Capacitor shell, so the two never conflict.

## Never do this

- Never put the Supabase `service_role`/secret key in frontend code, `.env`, or anywhere
  that ships to the browser. Only the `anon`/`publishable` key belongs in `VITE_SUPABASE_ANON_KEY`.
- Never commit `.env` — it's already in `.gitignore`. Commit `.env.example` (blank values)
  instead.
