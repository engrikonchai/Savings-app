import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

interface CardProps extends ViewProps {
  variant?: 'cream' | 'elevated' | 'glass';
  padded?: boolean;
}

export function Card({ variant = 'cream', padded = true, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        padded && styles.padded,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
  padded: {
    padding: spacing.lg,
  },
});

const VARIANT_STYLES = {
  cream: {
    backgroundColor: colors.cream,
    ...shadows.card,
  },
  elevated: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
} as const;
