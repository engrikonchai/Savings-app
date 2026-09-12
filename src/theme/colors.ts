/**
 * CarGoal color system.
 * Dark graphite shell with warm cream surfaces and a forest-green accent.
 */
export const colors = {
  // Dark graphite backgrounds
  background: '#14161A',
  backgroundElevated: '#1C1F24',
  backgroundSunken: '#0E1013',

  // Warm cream surfaces (cards, inputs)
  cream: '#F7F1E6',
  creamMuted: '#EDE4D3',
  creamBorder: '#E1D5BD',

  // Forest green accent
  accent: '#1F6F4A',
  accentDark: '#154D33',
  accentLight: '#35A46B',
  accentSoft: '#173226',

  // Status
  spend: '#D9634F',
  spendSoft: '#3A2320',
  save: '#35A46B',
  saveSoft: '#123726',

  // Text on dark background
  textPrimary: '#F7F1E6',
  textSecondary: '#A7ADB4',
  textTertiary: '#6E747C',

  // Text on cream surfaces
  inkPrimary: '#1C1E1B',
  inkSecondary: '#5B5A50',
  inkTertiary: '#8A8778',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(10, 12, 14, 0.6)',
} as const;

export type ColorToken = keyof typeof colors;
