import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, fontFamily } from '../theme';

interface LogoMarkProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Compact CarGoal lettermark: an emerald badge with a soft glow, used above onboarding and on share cards. */
export function LogoMark({ size = 40, style }: LogoMarkProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
        },
        style,
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.48, lineHeight: size * 0.56 }]}>C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  letter: {
    fontFamily: fontFamily.extraBold,
    color: colors.inkPrimary,
  },
});
