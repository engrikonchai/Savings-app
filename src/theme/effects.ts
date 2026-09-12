import { ViewStyle } from 'react-native';
import { colors } from './colors';

/**
 * Reusable shadow presets for the "premium iOS app" look — soft, diffuse
 * shadows rather than hard drop shadows, plus an emerald glow used behind
 * the hero progress ring and primary CTAs.
 */
export const shadows = {
  soft: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  } satisfies ViewStyle,
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  } satisfies ViewStyle,
};
