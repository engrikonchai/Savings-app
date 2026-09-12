import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface CardProps extends ViewProps {
  variant?: 'cream' | 'elevated';
  padded?: boolean;
}

export function Card({ variant = 'cream', padded = true, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'cream' ? styles.cream : styles.elevated,
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
  cream: {
    backgroundColor: colors.cream,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  padded: {
    padding: spacing.lg,
  },
});
