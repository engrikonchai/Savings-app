import { TextStyle } from 'react-native';

/**
 * Type scale for CarGoal. Uses Manrope (loaded via expo-font) with a
 * system-font fallback so screens never render blank while fonts load.
 */
export const fontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
} as const;

type Weight = keyof typeof fontFamily;

const make = (
  fontSize: number,
  weight: Weight,
  extra?: Partial<TextStyle>,
): TextStyle => ({
  fontSize,
  fontFamily: fontFamily[weight],
  ...extra,
});

export const typography = {
  display: make(44, 'extraBold', { letterSpacing: -1, lineHeight: 48 }),
  h1: make(30, 'extraBold', { letterSpacing: -0.5, lineHeight: 36 }),
  h2: make(24, 'bold', { letterSpacing: -0.3, lineHeight: 30 }),
  h3: make(19, 'bold', { lineHeight: 24 }),
  bodyLarge: make(17, 'medium', { lineHeight: 24 }),
  body: make(15, 'medium', { lineHeight: 21 }),
  caption: make(13, 'semiBold', { lineHeight: 18 }),
  micro: make(11, 'bold', { lineHeight: 14, letterSpacing: 0.5 }),
  button: make(16, 'bold', { letterSpacing: 0.2 }),
} as const;
