/**
 * Capacitor config — not wired up yet (no `@capacitor/core`/`@capacitor/cli` dependency is
 * installed, and no native `ios/`/`android/` project exists in this repo). This file exists
 * so that running `npx cap init` / `npx cap add ios` later needs zero guesswork: the web app
 * already builds a static `dist/` folder (`npm run build`) that matches `webDir` below, and
 * every screen is already safe-area-aware (see src/lib/layout.ts + the `--safe-*` CSS
 * variables in src/styles/global.css) so the WebView can render edge-to-edge behind the
 * Dynamic Island / notch and home indicator without extra work.
 *
 * To actually package for iOS once you're ready (see README's "iPhone" section):
 *   npm install @capacitor/core @capacitor/cli @capacitor/ios
 *   npx cap add ios
 *   npm run build && npx cap sync ios
 *   npx cap open ios
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.olyvi.dreamsaver',
  appName: 'Dreamsaver',
  webDir: 'dist',
  ios: {
    // Content already accounts for the safe area itself (see Shell.tsx), so let the WebView
    // extend under the status bar/notch instead of letting iOS letterbox it.
    contentInset: 'never',
  },
  server: {
    // Local dev convenience only (`npx cap run ios --livereload`) — never set this for a
    // production build; leaving it unset means the app loads its own bundled dist/ instead of
    // reaching over the network for anything.
    androidScheme: 'https',
  },
};

export default config;
