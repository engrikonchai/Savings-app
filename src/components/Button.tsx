import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  return (
    <PressableScale
      onPress={isInteractive ? onPress : undefined}
      haptic={variant === 'danger' ? 'medium' : 'light'}
      disabled={!isInteractive}
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.inkPrimary : colors.accent} />
      ) : (
        <Text style={[styles.label, VARIANT_LABEL_STYLES[variant]]}>{label}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.button,
  },
});

const VARIANT_STYLES: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: { backgroundColor: colors.cream },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.glassBorder },
  danger: { backgroundColor: colors.spendSoft, borderWidth: 1.5, borderColor: colors.spend },
};

const VARIANT_LABEL_STYLES: Record<Variant, { color: string }> = {
  primary: { color: colors.inkPrimary },
  secondary: { color: colors.inkPrimary },
  ghost: { color: colors.textPrimary },
  danger: { color: colors.spend },
};
