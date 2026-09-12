/**
 * CarGoal color system — v2 "electric emerald" redesign.
 * Deep graphite shell, warm ivory surfaces used sparingly, and an
 * electric emerald accent reserved for progress and success states.
 */
export const colors = {
  // Graphite backgrounds
  background: '#101114',
  backgroundElevated: '#1A1B1F',
  backgroundSunken: '#0A0B0D',

  // Warm ivory surfaces (cards, inputs) — used sparingly
  cream: '#F7F3EA',
  creamMuted: '#EEE7D6',
  creamBorder: '#E2D8C0',

  // Electric emerald accent
  accent: '#13E296',
  accentDark: '#0A9C69',
  accentLight: '#6BFFCE',
  accentSoft: 'rgba(19, 226, 150, 0.14)',
  accentGlow: 'rgba(19, 226, 150, 0.45)',

  // Status
  spend: '#FF6B57',
  spendSoft: 'rgba(255, 107, 87, 0.14)',
  save: '#13E296',
  saveSoft: 'rgba(19, 226, 150, 0.14)',

  // Text on dark background
  textPrimary: '#F7F3EA',
  textSecondary: '#9BA0A8',
  // Lightened from #63666E — the original sat at ~3.5:1 against the dark
  // background, below the 4.5:1 needed for small text like timestamps and
  // section labels. Same muted gray, just legible.
  textTertiary: '#7A7D84',

  // Text on ivory surfaces
  inkPrimary: '#181A16',
  inkSecondary: '#5C594C',
  // Darkened from #8B8776 — the original sat at ~3.3:1 against cream, below
  // the 4.5:1 needed for small text like StatTile's micro labels. Same warm
  // gray, just legible.
  inkTertiary: '#6B6858',

  // Subtle glass effects on dark surfaces
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassHighlight: 'rgba(255, 255, 255, 0.14)',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(6, 7, 8, 0.65)',
} as const;

export type ColorToken = keyof typeof colors;
