# [APP NAME]

A goal-based savings app: pick a goal type, set a target and a date, and track real
progress — weekly target, predicted completion date, and "Dream Days" gained or lost on
every contribution or impulse purchase. Everything is local: no login, no backend, no
payments. All data lives in the browser's `localStorage`.

## Stack

Vite + React + TypeScript, no UI framework — plain CSS custom properties for the light/dark
theme (Apple system blue, iOS-native spacing and type). Built to be renamed: every visible
mention of the app name is the placeholder `[APP NAME]` (see `TopBar.tsx` and
`Celebration.tsx`), so swapping in a real name is a single find-and-replace.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`). Resize the browser
to a phone width (375–430px) to see it as intended — it's a mobile-first layout with no
desktop breakpoint.

```bash
npm run build    # type-checks and produces a production build in dist/
npm run preview  # serves that production build locally
```

## What's implemented

- First-open welcome flow → goal type picker (First Car, Travel, New Phone, Gaming Setup,
  Education, Custom) → 3-step goal creation (name, cost, target date) → live dashboard.
- Dashboard: progress ring, saved/remaining, predicted date, weekly target, Add Money,
  Should I Buy It?, recent activity, and a completion CTA once the goal is reached.
- Add Money: quick amounts, a source picker, and a real "days closer" result.
- Dream Days ("Should I buy it?"): shows the day cost before you decide, then Skip it
  (adds the money to savings) or Buy anyway (logs the spend, pushes the predicted date out).
- History (full transaction timeline + this-month summary), Insights (weekly bar chart,
  best/average week, a personalized "your move this week" tip, pace projection).
- Profile: manage/edit goal, switch goal type, currency picker, notifications toggle,
  System/Light/Dark appearance.
- Goal-completion celebration with a shareable story-card mockup (`navigator.share` where
  available, clipboard fallback otherwise).

## Data model

Everything persists under a single `localStorage` key (`savings-app-state-v1`): the active
goal (type, name, target amount, saved amount, predicted date), the full transaction list,
currency, appearance preference, and a couple of small profile prefs. See `src/lib/types.ts`.

Calculations (progress %, weekly target, predicted date, Dream Days) are in
`src/lib/calc.ts` — every one of them is derived from real state, not hardcoded.
