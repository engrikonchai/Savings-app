import React from 'react';
import { StyleProp } from 'react-native';
import { Image, ImageStyle } from 'expo-image';

// Natural aspect ratio of the tightly-cropped mascot artwork (width/height),
// so callers can size by height alone and the mark never stretches.
const ASPECT_RATIO = 1093 / 1026;

interface LogoMarkProps {
  /** Rendered height in px; width follows the artwork's natural aspect ratio. */
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/** The PiggyMy mascot mark — used above onboarding, in Settings, and on the share card. */
export function LogoMark({ size = 40, style }: LogoMarkProps) {
  return (
    <Image
      source={require('../../assets/piggymy-mark.png')}
      style={[{ width: size * ASPECT_RATIO, height: size }, style]}
      contentFit="contain"
      accessibilityLabel="PiggyMy"
    />
  );
}
