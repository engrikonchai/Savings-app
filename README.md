# PiggyMy 🐷

A polished, iOS-first savings app for young people saving toward a first car,
a trip, a new phone — or anything else that matters to them. No login, no
bank connection, no ads. Everything lives on your device.

Built with **Expo**, **React Native**, **TypeScript**, and **Expo Router**.

## Features

- **Onboarding** — pick a goal type: First Car, Travel, New Phone, or Custom.
- **Create goal** — name, target amount (EUR by default), target date, optional photo.
- **Home dashboard** — an animated progress ring, amount saved vs. target,
  percentage, remaining amount, and the daily/weekly pace needed to hit your
  date.
- **Add transaction** — quickly log money saved or spent, with an optional note.
- **Result screen** — see how many days closer (or farther) that transaction
  moved your target date, with a satisfying animated reveal and haptics.
- **History** — a simple, grouped list of every saving and spending entry.
- **Settings** — currency (EUR/USD/GBP), a notifications placeholder, and a
  one-tap reset that wipes all local data.

Design language: dark graphite shell, warm cream cards, forest-green accent,
large confident typography (Manrope), smooth spring animations, and light
haptic feedback on every tap — built to feel like a modern goal-tracking app,
not a spreadsheet.

## Project structure

```
app/                      Expo Router screens (file-based routing)
  _layout.tsx             Root layout: fonts, providers, stack navigator
  index.tsx                Redirects to onboarding or the dashboard
  onboarding.tsx           Goal type picker
  create-goal.tsx          Goal creation form
  add-transaction.tsx      Modal: log a saving/spending entry
  result.tsx               Modal: shows the day-shift after a transaction
  (tabs)/                  Bottom tab navigator
    index.tsx               Home dashboard
    history.tsx              Transaction history
    settings.tsx             Currency, notifications, reset

src/
  components/             Reusable UI building blocks (Button, Card, TextField,
                          ProgressRing, ProgressBar, SegmentedControl, ...)
  store/                  AsyncStorage persistence + React context/hooks
  theme/                  Colors, typography, spacing tokens
  types/                  Shared TypeScript models
  utils/                  Currency/date formatting, goal math
  constants/              Goal type metadata
```

All data (the goal, transactions, settings) is persisted locally with
`@react-native-async-storage/async-storage` — nothing is sent to a server.

## Running the app in Expo Go

1. **Install dependencies** (only needed once):

   ```bash
   npm install
   ```

2. **Start the dev server**:

   ```bash
   npm start
   ```

   This runs `expo start` and opens the Metro bundler with a QR code in your
   terminal / browser.

3. **Open it on your phone**:
   - Install **Expo Go** from the App Store (iOS) or Play Store (Android).
   - Scan the QR code shown in the terminal with your iPhone's Camera app
     (iOS) or directly within the Expo Go app (Android).
   - The app will build and load on your device — no Mac or Xcode required.

   Alternatively, press `i` in the terminal to open an iOS Simulator (macOS +
   Xcode only) or `w` for the web preview.

4. **Make changes**: Fast Refresh is on — edit any file under `app/` or `src/`
   and the app updates instantly on your device.

### Useful scripts

```bash
npm start          # Start Metro / Expo dev server
npm run ios        # Start and open in iOS Simulator (macOS only)
npm run android    # Start and open in an Android emulator
npm run web        # Run in the browser
npm run typecheck  # Run TypeScript with no emit, strict mode
```

## Notes for v1

- Single active goal at a time — creating a new goal (or resetting data)
  replaces the previous one.
- "Days closer / farther" is calculated from the daily saving pace required
  to hit your goal on time: saving above that pace pulls your finish date
  in, spending pushes it back.
- Notifications are a UI placeholder only — no reminders are scheduled yet.
