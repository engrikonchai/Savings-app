import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { PressableScale } from './PressableScale';

interface FloatingActionButtonProps {
  label: string;
  onPress: () => void;
}

/** A pill-shaped, glowing primary action that floats above the tab bar. */
export function FloatingActionButton({ label, onPress }: FloatingActionButtonProps) {
  return (
    <PressableScale style={styles.button} onPress={onPress} haptic="light">
      <Ionicons name="add-circle" size={22} color={colors.inkPrimary} />
      <Text style={styles.label}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  label: {
    ...typography.button,
    color: colors.inkPrimary,
  },
});
